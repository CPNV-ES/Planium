import {getFLights} from "@/utils/api.js";
import fs from 'fs';
import path from 'path';

// data structure that allows logs to be stored
// Source : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
const logs = new Map()

export async function prepareScene(scene){
    //------------Uncomment if performance is low---------------------
    // scene.requestRenderMode = true;
    // scene.maximumRenderTimeChange = Infinity;
    // scene.globe.maximumScreenSpaceError = 24;
    // scene.globe.tileCacheSize = 1000;
    // scene.globe.preloadAncestors = false;
    // scene.globe.loadingDescendantLimit = 20;
    scene.primitives.removeAll();
    scene.contextOptions = {
        allowTextureFilterAnisotropic: false,
        cameraUnderground: false
    }


    const controller = scene.screenSpaceCameraController;
    // Disable all default controls
    controller.enableRotate = false;
    controller.enableTranslate = false;
    controller.enableZoom = false;
    controller.enableTilt = false;
    controller.enableLook = false;

    controller.lookEventTypes = Cesium.CameraEventType.LEFT_DRAG;
    controller.enableLook = true;
    // source : https://cesium.com/learn/cesiumjs/ref-doc/Camera.html
    // source : https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent

    // minimum FOV degrees in radian
    const MIN_FOV = Cesium.Math.toRadians(5);

    // maximum FOV degrees in radian
    const MAX_FOV = Cesium.Math.toRadians(100);

    // increment in radian for each step of the mouse
    const STEP = Cesium.Math.toRadians(2);

    const canvas = scene.canvas;

    // listen for mouse wheel events
    canvas.addEventListener(
        "wheel",
        (event) => {
            event.preventDefault();

            const camera = scene.camera;
            let fov = camera.frustum.fov;

            // increment the FOV
            fov += event.deltaY > 0 ? STEP : -STEP;

            // check the limits
            camera.frustum.fov = Cesium.Math.clamp(
                fov,
                MIN_FOV,
                MAX_FOV
            );
        },
        { passive: false }
    );


}

//Prevent the user to move in the scene
export function removeMoving(scene){
    scene.screenSpaceCameraController.enableRotate = false;
}
export async function loadPlanes(viewer, location){
    const airplaneUri = await Cesium.IonResource.fromAssetId(4359085);
    const data = await getFLights('http://localhost:8080/flights', {long: location.long , lat: location.lat})

    if(data !== undefined) {
        const osmBuildings = await Cesium.createOsmBuildingsAsync();
        // Uncomment if you want 3d buildings dispalyed
        // viewer.scene.primitives.add(osmBuildings);

        /* Initialize the viewer clock:
          Assume the radar samples are 30 seconds apart, and calculate the entire flight duration based on that assumption.
          Get the start and stop date times of the flight, where the start is the known flight departure time (converted from PST
            to UTC) and the stop is the start plus the calculated duration. (Note that Cesium uses Julian dates. See
            https://simple.wikipedia.org/wiki/Julian_day.)
          Initialize the viewer's clock by setting its start and stop to the flight start and stop times we just calculated.
          Also, set the viewer's current time to the start time and take the user to that time.
        */
        const timeStepInSeconds = 30;
        // const totalSeconds = timeStepInSeconds * (flightData.length - 1);
        const start = Cesium.JulianDate.now();
        const stop = Cesium.JulianDate.addSeconds(start, 10000000000, new Cesium.JulianDate());

        viewer.clock.startTime = start.clone();
        // viewer.clock.stopTime = stop.clone();
        viewer.clock.currentTime = start.clone();

        // viewer.timeline.zoomTo(start, stop);
        // Speed up the playback speed 50x.
        viewer.clock.multiplier = 1;
        // Start playing the scene.
        viewer.clock.shouldAnimate = true;

        // The SampledPositionedProperty stores the position and timestamp for each sample along the radar sample series.

        for (let i = 0; i < data.length; i++) {
            const positionProperty = new Cesium.SampledPositionProperty();

            const flight = data[i];

            // Declare the time for this individual sample and store it in a new JulianDate instance.
            // const time = Cesium.JulianDate.addSeconds(start, i * timeStepInSeconds, new Cesium.JulianDate());

            const position = Cesium.Cartesian3.fromDegrees(flight.long, flight.lat, flight.alt);
            // Store the position along with its timestamp.
            // Here we add the positions all upfront, but these can be added at run-time as samples are received from a server.
            positionProperty.addSample(start, position);
            // Make planes appear even if it's too late
            positionProperty.forwardExtrapolationType = Cesium.ExtrapolationType.HOLD
            positionProperty.backwardExtrapolationType = Cesium.ExtrapolationType.HOLD

            // viewer.entities.add({
            //     description: `Location: (${flight.long}, ${flight.lat}, ${flight.alt})`,
            //     position: position,
            //     point: {pixelSize: 10, color: Cesium.Color.RED}
            // });

            await loadModel(viewer, start, stop, positionProperty, airplaneUri, flight.id);

        }
    }


}

async function loadModel(viewer, start, stop, positionProperty, airplaneUri, id) {
    // Load the glTF model from Cesium ion.
    const airplaneEntity = viewer.entities.add({
        id: id,
        availability: new Cesium.TimeIntervalCollection([ new Cesium.TimeInterval({ start: start, stop: stop }) ]),
        position: positionProperty,
        // Attach the 3D model instead of the green point.
        model: {uri: airplaneUri,minimumPixelSize: 100  },
        // Automatically compute the orientation from the position.
        orientation: new Cesium.VelocityOrientationProperty(positionProperty),
        path: new Cesium.PathGraphics({ width: 3 , trailTime: 30})
    });
}

export async function updatePlanes(viewer, location){
    const data = await getFLights('http://localhost:8080/flights', {long:location.long , lat: location.lat})
    if (data.length > 0){
        const futureTime = Cesium.JulianDate.addSeconds(
            viewer.clock.currentTime,
            31,
            new Cesium.JulianDate()
        );
        if (data !== undefined && viewer.entities !== undefined) {
            viewer.entities.values.forEach(async (entity) => {
                const flight = data.find(flight => flight.id === entity.id)
                if(flight !== undefined){
                    await addNextPostion(flight, entity, futureTime)
                }else if(entity.id !== 'Moon'){
                    viewer.entities.remove(entity)
                }

            })

            await addNewPlanes(viewer, data)
        }
    }

}

async function addNextPostion(flight, entity, futureTime){
    const time = Cesium.JulianDate.now();
    const nextPos = Cesium.Cartesian3.fromDegrees(flight.long, flight.lat, flight.alt)
    entity.position.addSample(futureTime, nextPos)
}

async function sendToLogFile() {
    /*
    Source : https://brightdata.fr/blog/donnees-web/fetch-api-in-javascript
    */

    // Source : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from
    // Convert map to array
    let logsArray = Array.from(logs.values());

    const url = "http://localhost:8080/logs"

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
            // Source : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/join
            body: JSON.stringify({
                message: logsArray.join('\n'),
            }),
        });

        // Clear the logs once they have been sent to the API
        logs.clear();

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
    } catch (error) {
        console.error(error.message);
    }
}


function determinatePlane(flight) {
    /*
        Prompt to Claude :
        I want to predict the geographical position of an aircraft in 30 seconds.

        Available data:
        - Current position: latitude (degrees), longitude (degrees), altitude (meters)
        - Ground speed: m/s
        - Heading: degrees (0° = North, 90° = East)
        - Vertical speed: m/s

        Provide the complete mathematical formulas to calculate the new latitude, longitude, and altitude,
        taking into account the curvature of the Earth.
        */
    const long = flight.long
    const lat = flight.lat
    const alt = flight.alt
    const speed = flight.velocity
    const heading = flight.heading
    const vertical_rate = flight.vertical_rate

    const pi = Math.PI;

    // prediction time in seconds
    const delta_time = 30;

    // Convert to radians
    const long_rad = long * pi / 180
    const lat_rad = lat * pi / 180
    const heading_rad = heading * pi / 180

    const earth_radius = 6371000  // meters

    // Horizontal distance traveled
    const distance = speed * delta_time

    // Calculate new latitude
    const new_lat_rad = Math.asin(
        Math.sin(lat_rad) * Math.cos(distance / earth_radius) +
        Math.cos(lat_rad) * Math.sin(distance / earth_radius) * Math.cos(heading_rad)
    )

    // Calculate new longitude
    const delta_long = Math.atan2(
        Math.sin(heading_rad) * Math.sin(distance / earth_radius) * Math.cos(lat_rad),
        Math.cos(distance / earth_radius) - Math.sin(lat_rad) * Math.sin(new_lat_rad)
    )
    const new_long_rad = long_rad + delta_long

    // Calculate new altitude
    const new_alt = alt + vertical_rate * delta_time

    // Convert result back to degrees
    const new_lat = new_lat_rad * 180 / pi
    const new_long = new_long_rad * 180 / pi

    // Return predicted position
    return Cesium.Cartesian3.fromDegrees(new_long, new_lat, new_alt);
}

function calculateMoonPlane(flight,viewer) {
    /*
    Prompt to Claude :
    If I have a person (P), a plane (A), and the moon (L), I would like to know if the plane is in front of the moon
    from P's point of view. Please provide the formulas needed for this calculation.

    P = (xₚ, yₚ, zₚ)
    A = (xₐ, yₐ, zₐ)
    L = (xₗ, yₗ, zₗ)

    vector person towards airplane = PA = u⃗ = (xₐ - xₚ, yₐ - yₚ, zₐ - zₚ)
    vector person towards moon = PL = v⃗ = (xₗ - xₚ, yₗ - yₚ, zₗ - zₚ)

    dot product
    u⃗ · v⃗ = (xₐ - xₚ)(xₗ - xₚ) + (yₐ - yₚ)(yₗ - yₚ) + (zₐ - zₚ)(zₗ - zₚ)


    vectors norm
    ||u⃗|| = √[(xₐ - xₚ)² + (yₐ - yₚ)² + (zₐ - zₚ)²]
    ||v⃗|| = √[(xₗ - xₚ)² + (yₗ - yₚ)² + (zₗ - zₚ)²]

    calculate angle O
    O = arccos[(u⃗ · v⃗) / (||u⃗|| × ||v⃗||)]

    compare the angle of the moon with that of the airplane
    O ≤ 0.0045 (radian)
    */
    const positionCartesian = Cesium.Cartesian3.fromDegrees(flight.long, flight.lat, flight.alt);

    const x_A = positionCartesian.x;
    const y_A = positionCartesian.y;
    const z_A = positionCartesian.z;

    const cameraPos = viewer.camera.position;
    const x_P = cameraPos.x;
    const y_P = cameraPos.y;
    const z_P = cameraPos.z;


    let moonPos = viewer.scene.moon.position;
    if (!moonPos) {
        moonPos = Cesium.Simon1994PlanetaryPositions.computeMoonPositionInEarthInertialFrame(
            viewer.clock.currentTime
        );
    }

    const x_L = moonPos.x;
    const y_L = moonPos.y;
    const z_L = moonPos.z;

    const P_To_A = {
        x: x_A - x_P,
        y: y_A - y_P,
        z: z_A - z_P
    };

    const P_To_L = {
        x: x_L - x_P,
        y: y_L - y_P,
        z: z_L - z_P
    };

    const dot = (x_A - x_P)*(x_L-x_P) + (y_A-y_P)*(y_L-y_P) + (z_A-z_P)*(z_L-z_P)

    const norme_u = Math.sqrt((x_A - x_P)**2 + (y_A-y_P)**2 + (z_A-z_P)**2);
    const norme_v = Math.sqrt((x_L - x_P)**2 + (y_L-y_P)**2 + (z_L-z_P)**2);

    const corner_O = Math.acos(dot / (norme_u * norme_v));

    // Source : https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Map/has
    const key = `${flight.id}`

    const currentLog = logs.get(flight.id);

    if (corner_O <= 0.0045) {
        if (!currentLog) {
            logs.set(key, `Aircraft pass in front of the moon | Camera : ${cameraPos} | Aircraft ID : ${flight.id} 
            | Time : ${new Date().toISOString()}`);
        }
    } else if (corner_O <= 0.0135) {
        // Source : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
        if (!currentLog || !currentLog.startsWith("Aircraft pass in front")) {
            logs.set(key, `Aircraft pass close to the moon | Camera : ${cameraPos} | Aircraft ID : ${flight.id} 
            | Time : ${new Date().toISOString()}`);
        }
    }

}
async function addNewPlanes(viewer, data){
    const airplaneUri = await Cesium.IonResource.fromAssetId(4359085);
    data.forEach(async (flight) => {
        if (viewer.entities.values.find(entity => entity.id === flight.id) === undefined){
            const positionProperty = new Cesium.SampledPositionProperty();
            const position = Cesium.Cartesian3.fromDegrees(flight.long, flight.lat, flight.alt)
            positionProperty.addSample(viewer.clock.currentTime, position);
            positionProperty.forwardExtrapolationType = Cesium.ExtrapolationType.HOLD
            positionProperty.backwardExtrapolationType = Cesium.ExtrapolationType.HOLD
            await loadModel(viewer, viewer.clock.currentTime, viewer.clock.stopTime, positionProperty, airplaneUri, flight.id)
        }
    })
}

// Source : https://developer.mozilla.org/en-US/docs/Web/API/Window/setInterval
// Send the logs every 15 seconds
setInterval(sendToLogFile, 15000)