"""
Author : Sofian Hussein
Date : 14.01.2026
Project : FastAPI Flights Backend
Desc : API data fetching script
"""
import requests
from os import path, getenv
from dotenv import load_dotenv
from fastapi import HTTPException

dotenv_path = path.join(path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path)


def get_opensky_token():
    client_id = getenv("OPENSKY_CLIENT_ID")
    client_secret = getenv("OPENSKY_CLIENT_SECRET")

    auth_url = "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token"

    payload = {
        "grant_type": "client_credentials",
        "client_id": client_id,
        "client_secret": client_secret
    }

    try:
        response = requests.post(auth_url, data=payload)
        response.raise_for_status()

        token_data = response.json()
        return token_data.get("access_token")

    except requests.exceptions.RequestException as e:
        print(f"Erreur lors de l'authentification : {e}")
        return None


def get_flights(user_lat, user_long):
    """
    Fetch flight data from OpenSky Network API for Switzerland region

    Args:
        user_lat: User latitude in degrees
        user_long: User longitude in degrees

    Returns:
        List of dictionaries containing flight data

    Example:
        [{'origin_country': 'Portugal', 'lat': 46.8, 'long': 7.0111, 'alt': 10.51, 'velocity': 196.84,
        'heading': 231.15, 'vertical_rate': 2.28},...]

    Field Descriptions:
        "origin_country": country of origin of the plane
        "lat": plane latitude (°) -90 to 90
        "long": plane longitude (°) -180 to 180
        "alt": plane altitude (m)
        "velocity": plane speed (m/s)
        "heading": plane heading (°) 0 to 360, true north
        "vertical_rate": Vertical speed (m/s)
    """
    url = "https://opensky-network.org/api/states/all"

    """
    Compute the bounding box for fetching flight data from the OpenSky Network API
    based on the user's location. The goal is to define a rectangular region that
    covers the visible sky towards the south from the user's position.
    
    In this example, we use Ste-Croix as a reference point,
    Geneva Airport is excluded from the area to avoid having aircraft on the ground.
    """
    params = {
        "lamin": user_lat-0.52,
        "lomin": user_long-1,
        "lamax": user_lat,
        "lomax": user_long+1
    }
    token = get_opensky_token()
    # search for data at the URL specified with the parameters
    response = requests.get(url, params=params, headers={'Authorization': 'Bearer ' + token})

    if response.status_code != 200:
        if response.status_code == 429:
         raise HTTPException(status_code=429, detail="Item not found")
        return response
    # extract only the JSON of the response
    data = response.json()

    if not data.get("states"):
        return []

    # list that contains all flights
    flights = []

    # loop that iterates through the json
    for state in data["states"]:
        # creating a dictionary that stores only useful data
        flight = {
            "id": state[1],
            "origin_country": state[2],
            "lat": state[6],
            "long": state[5],
            "alt": state[7],
            "velocity": state[9],
            "heading": state[10],
            "vertical_rate": state[11]
        }
        # add the flight to the list of aircraft
        flights.append(flight)

    return flights
