"""
Author : Sofian Hussein
Date : 14.01.2026
Project : FastAPI Flights Backend
Desc : API data fetching script
"""
import requests


def get_flights(user_lat, user_long):
    """
    Fetch flight data from OpenSky Network API for Switzerland region

    Args:
        user_lat: User latitude in degrees
        user_long: User longitude in degrees

    Returns:
        List of dictionaries containing flight data

        [{'origin_country': 'Portugal', 'lat': 46.8, 'long': 7.0111, 'alt': 10.51, 'velocity': 196.84,
        'heading': 231.15, 'vertical_rate': 2.28},...]

    Example:
        "origin_country": country of origin of the plane
        "lat": plane latitude (°) -90 to 90
        "long": plane longitude (°) -180 to 180
        "alt": plane altitude (km)
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

    # search for data at the URL specified with the parameters
    response = requests.get(url, params=params)

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
            "origin_country": state[2],
            "lat": state[6],
            "long": state[5],
            "alt": state[7]/1000 if state[7] else state[7],
            "velocity": state[9],
            "heading": state[10],
            "vertical_rate": state[11]
        }
        # add the flight to the list of aircraft
        flights.append(flight)

    return flights
