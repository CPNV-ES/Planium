import requests
import json

def get_moon_data():
    """
    Fetch Moon's RA, DEC and phase from Horizon API

    Returns:
        Dict containing list of moon's data at specific times
    """
    url = 'https://ssd.jpl.nasa.gov/api/horizons.api'

    API_fetch_params = { # src: https://ssd-api.jpl.nasa.gov/doc/horizons.html
            'format': 'json',
            'COMMAND': "'301'",         # Moon
            'OBJ_DATA': 'NO',
            'MAKE_EPHEM': 'YES',
            'EPHEM_TYPE': 'OBSERVER',
            'CENTER': "'500@399'",      # Earth's center coordinates
            'START_TIME': "'2026-01-15'",   # From
            'STOP_TIME': "'2026-01-20'",    # To
            'STEP_SIZE': "'1h'",        # Step
            'QUANTITIES': "'1,9'",    # 1 = RA/DEC, Quantity 9 = Brightness/Phase
        }


    response = requests.get(url, params=API_fetch_params)
    data = response.json()

    if 'result' in data:
        # Save the raw text to a json file, must then read "result" key to get data
        with open('moon_data/moon_data.json', 'w') as f:
            json.dump(data, f, indent=4)
        print("Success! Saved NASA data to moon_data.json")