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
        // include the parameters in the url
        const fullURL = `${url}?lat=${lat}&long=${long}`;
        const response = await fetch(fullURL);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const result = await response.json();
        console.log(result);
        return result;
    } catch (error) {
        console.error(error.message);
        return null;
    }
}
