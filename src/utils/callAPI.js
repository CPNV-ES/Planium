/*
Author : Sofian Hussein
Date : 19.01.2026
Project : call the API
Desc : call the API from the frontend
*/
"use strict";

// Source : https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
export async function getData(url, lat = null, long = null) {
    try {
        // Include the parameters in the url
        const fullURL = `${url}?lat=${lat}&long=${long}`;

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
