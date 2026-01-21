/*
Author : Sofian Hussein
Date : 19.01.2026
Project : call the API
Desc : call the API from the frontend
*/
"use strict";

// Source : https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
export async function getData(url, params = {}) {
    /*
    Example :
        getData("http://localhost:8080/flights", { lat: 48.85, long: 2.35 });
    */
    try {
        // Creates the parameter string from the params object
        const queryString = new URLSearchParams(params).toString();
        const fullURL = queryString ? `${url}?${queryString}` : url;

        // Fetch data from the API
        const response = await fetch(fullURL);

        // Check if the response was successful
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        // Parse the JSON response
        const result = await response.json();
        console.log(result);
        return result;
    } catch (error) {
        // Log the error and return null
        console.error(error.message);
        return null;
    }
}
