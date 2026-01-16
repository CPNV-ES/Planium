import requests

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

    response = requests.get(url, params=API_fetch_params)
    data = response.json()

    if not data.get('result'):
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
                        'ra': round(ra_decimal, 6),   # 6 Decimal Right Ascension (degrees)
                        'dec': round(dec_decimal,6),  # 6 Decimal Declination (degrees)
                        'phase': float(values[-1]) # Phase decimal percentage (0.00 - 100.00)
                    }
                    moon_data.append(entry)
                except Exception as e:
                    print(f"Error: {e}")
                    continue
    return moon_data