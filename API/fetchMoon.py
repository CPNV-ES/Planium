import math

import numpy as np
import requests
from requests.adapters import HTTPAdapter
from urllib3 import Retry


def get_moon_data(start_time, stop_time, step): # src: https://ssd-api.jpl.nasa.gov/doc/horizons.html
    """
    Fetch Moon's RA, DEC and phase from Horizon API

    Returns:
        Dict containing list of moon's data at specific times
    """
    url = 'https://ssd.jpl.nasa.gov/api/horizons.api'

    API_fetch_params = {
            'format': 'json',
            'COMMAND': "'301'",         # Moon
            'OBJ_DATA': 'NO',
            'MAKE_EPHEM': 'YES',
            'EPHEM_TYPE': 'OBSERVER',
            'CENTER': "'500@399'",      # Earth's center coordinates
            'START_TIME': f"'{start_time}'",   # From 'YYYY-MM-DD'
            'STOP_TIME': f"'{stop_time}'",    # To 'YYYY-MM-DD'
            'STEP_SIZE': f"'{step}'",        # Step (ex.'1h')
            'QUANTITIES': "'1,9'",    # 1 = RA/DEC, Quantity 9 = Brightness/Phase
        }

    # setup retries to handle SSLError or connection drops
    # src: https://urllib3.readthedocs.io/en/stable/reference/urllib3.util.html
    # src: https://requests.readthedocs.io/en/latest/user/advanced/
    session = requests.Session()
    retries = Retry(
        total=5,    # if a request fails, try 5 more times
        backoff_factor=1, # wait between tries to prevent overloading the system
        status_forcelist=[502, 503, 504] # only retry if server returns 502, 503, 504 error status (bad gateway/service unavailable)
    )
    # apply for any url 'http://'
    session.mount('http://', HTTPAdapter(max_retries=retries))

    try:
        response = requests.get(
            url,
            params=API_fetch_params, # pass api's custom params
            timeout=15 # trigger retry if server doesn't respond in 15s
        )
        response.raise_for_status() # raise Exception for any error
        data = response.json() # parse json response
    except Exception as e:
        print(e)
        return []

    # check if 'result' key exists
    if not data.get('result'):
        return []

    result = data.get('result', '')
    # check if data keyword 'SOE' was returned
    if '$$SOE' not in result:
        return []

    lines = data.get('result', '').split('\n') # Split text in lines

    moon_data = [] # dic with data to return

    is_data_zone = False # data zone flag
    for line in lines:
        if '$$SOE' in line: # start of data
            is_data_zone = True
            continue
        if '$$EOE' in line: # end of data
            is_data_zone = False
            break

        if is_data_zone:
            # ex: 2026-Jan-15 10:00     16 59 59.11 -27 49 59.3   -7.374   6.202\n
            values = []
            for v in line.split(): # loop through split values
                if v.strip(): # only keep if it's not an empty string
                    values.append(v)

             # NASA column mapping for Quantities 1,9:
                 # values[0,1] = Date, Time
                 # values[2,3,4] = RA (h, m, s)
                 # values[5,6,7] = DEC (d, m, s)
                 # values[8] = APmag
                 # values[9] = S-br
                 # values[10] = Illu% (Phase)

            if len(values) >= 10:
                try:
                    # Convert RA (sexagesimal) to decimal
                    ra_decimal = (
                    float(values[2]) # h (hours)
                    + float(values[3])/60    # min to h
                    + float(values[4])/3600  # seconds to h
                    )

                    # Convert DEC (sexagesimal) to decimal
                    # handle negative DEC for decimal addition
                    if "-" in values[5]:
                        sign=-1
                    else:
                        sign=1

                    dec_decimal = (
                    abs(float(values[5]))  # d (degrees) absolute value
                    + float(values[6])/60 # arcminutes to d
                    + float(values[7])/3600 # arcseconds to d
                    )

                    dec_decimal *= sign # apply sign

                    # structure return data
                    entry = {
                        'datetime': f"{values[0]} {values[1]}", # 'YYYY-MM-DD HH:SS'
                        'ra': round(ra_decimal, 6),   # 6 Decimal Right Ascension (hours)
                        'dec': round(dec_decimal,6),  # 6 Decimal Declination (degrees)
                        'phase': float(values[-1]) # Phase decimal percentage (0.00 - 100.00)
                    }
                    moon_data.append(entry)
                except Exception as e:
                    print(f"Error: {e}")
                    continue
    return moon_data

def get_cesium_moon_coordinates(moon_data, altitude_m):
    """
    Converts RA/Dec to X, Y, Z coordinates
    :param moon_data: datetime, ra, dec, phase
    :param altitude_m: altitude above Earth's surface in meters
    :return: dict with timestamp, X, Y, Z coordinates and moon phase
    """
    # Earth radius in meters
    earth_radius = 6371000
    # total distance from Earth's center to Moon
    r = earth_radius + altitude_m

    cesium_coordinates = []

    for entry in moon_data:
        # convert moon coordinates to radians src: src: https://skyandtelescope.org/astronomy-resources/right-ascension-declination-celestial-coordinates/
        # RA [hours] to degrees
        ra_deg = entry['ra'] * 15
        # RA [degrees] to radians
        ra_rad = math.radians(ra_deg)
        # Dec [degrees] to radians
        dec_rad = math.radians(entry['dec'])

        # convert spherical to cartesian src: https://mathworld.wolfram.com/SphericalCoordinates.html
        # x = r * cos(dec) * cos(ra)
        # y = r * cos(dec) * sin(ra)
        # z = r * sin(dec)
        x = r * math.cos(dec_rad) * math.cos(ra_rad)
        y = r * math.cos(dec_rad) * math.sin(ra_rad)
        z = r * math.sin(dec_rad)

        cesium_coordinates.append({
            'timestamp': entry['datetime'],
            'x': round(x, 6),
            'y': round(y, 6),
            'z': round(z, 6),
            'phase': entry['phase']
        })

    return cesium_coordinates

"""
# test
raw = get_moon_data('2026-01-15', '2026-01-20', '1h')
if raw:
    cesium_coordinates = get_cesium_moon_coordinates(raw, 10000)
    print(f"Sample Coord: {cesium_coordinates[0]}")
    print(f"Total points: {len(cesium_coordinates)}")
"""
