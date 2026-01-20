"""
Author : Sofian Hussein
Date : 15.01.2026
Project : FastAPI Flights Backend
Description: Backend service to fetch and serve live flight data using OpenSky API.
"""
import uvicorn
from fastapi import FastAPI, Query
from fetchFlights import get_flights
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/flights")
def get_flights_endpoint(
        lat: float = Query(None, description="User latitude"),
        long: float = Query(None, description="User longitude")
):
    """
    route that allows planes to be recovered

    :param lat: latitude of the user
    :param long: longitude of the user
    :return: a dict of all the flights
    """
    # Default to Ste-Croix if no coordinates provided
    if lat is None or long is None:
        lat, long = 46.82, 6.5

    # Fetch flights for the given coordinates
    flights = get_flights(lat, long)

    # If no data is found
    if not flights:
        return {"message": "No data found"}

    return flights


@app.get("/")
def read_root():
    """
    Default route

    :return: "message": "FastAPI Flights Backend Running"
    """
    return {"message": "FastAPI Flights Backend Running"}


"""
Source Claude : How to change the listening port with Fastapi ?
"""
uvicorn.run(app, host="0.0.0.0", port=8080)
