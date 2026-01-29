import {getFLights} from "@/utils/api.js";

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
        // const totalSeconds = timeStepInSeconds * (flightData.length - 1);
        const start = Cesium.JulianDate.now();
        const stop = Cesium.JulianDate.addSeconds(start, 86400, new Cesium.JulianDate());

        viewer.clock.startTime = start.clone();
        viewer.clock.clockRange = Cesium.ClockRange.UNBOUNDED
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
            positionProperty.addSample(start, position);
            calculateMoonPlane(position, viewer)
            // Make planes appear even if it's too late
            positionProperty.forwardExtrapolationType = Cesium.ExtrapolationType.HOLD
            positionProperty.backwardExtrapolationType = Cesium.ExtrapolationType.HOLD

            await loadModel(viewer, start, stop, positionProperty, airplaneUri, flight.id);

            positionProperty.addSample(getNextTimeBySecond(viewer, 30), determinatePlane(flight))
            calculateMoonPlane(determinatePlane(flight), viewer)
        }
    }


}

async function loadModel(viewer, start, stop, positionProperty, airplaneUri, id) {
    // Load the glTF model from Cesium ion.
    viewer.entities.add({
        id: "plane_" + id,
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

        if (data !== undefined && viewer.entities !== undefined) {
            viewer.entities.values.forEach(async (entity) => {
                    const flight = data.find(flight => entity.id.includes(flight.id))
                    if(flight !== undefined){
                        await addNextPostion(determinatePlane(flight), entity, getNextTimeBySecond(viewer, 30))
                        calculateMoonPlane(determinatePlane(flight), viewer)
                    }else if(entity.id.includes('plane') ){
                        viewer.entities.remove(entity)
                    }
                })
            }

            await addNewPlanes(viewer, data)
        }
    }


async function addNextPostion(nextPos, entity, futureTime){
    entity.position.addSample(futureTime, nextPos)
}

function getNextTimeBySecond(viewer, seconds){
    return Cesium.JulianDate.addSeconds(
        viewer.clock ? viewer.clock.currentTime : Cesium.JulianDate.now(),
        seconds,
        new Cesium.JulianDate()
    );
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



function determinatePlane(flight, delta_time) {
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
    If I have a person P (with coordinates x, y, z),
    a line segment representing the trajectory of an airplane from 0 to 60 seconds (points A_Now and A_Prediction),
    and the moon L (x, y, z),

    I would like to know if the airplane passes in front of the moon from P's point of view at any point during those
    60 seconds

    Please provide the detailed mathematical formulas needed to calculate that.
    */

    const positionFlightNow = Cesium.Cartesian3.fromDegrees(flight.long, flight.lat, flight.alt);

    const x_A_Now = positionFlightNow.x;
    const y_A_Now = positionFlightNow.y;
    const z_A_Now = positionFlightNow.z;

    const positionFlightPrediction = determinatePlane(flight, 60)

    const x_A_Predict = positionFlightPrediction.x;
    const y_A_Predict = positionFlightPrediction.y;
    const z_A_Predict = positionFlightPrediction.z;

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

    // P_To_L = P To Moon
    // the direction is the moon
    const P_To_L = {
        x: x_L - x_P,
        y: y_L - y_P,
        z: z_L - z_P
    };

    // P_To_A_Now
    // The direction of the plane now
    const P_To_A_Now = {
        x: x_A_Now - x_P,
        y: y_A_Now - y_P,
        z: z_A_Now - z_P
    };

    // the direction of the prediction
    const A_Now_To_A_Pred = {
        x: x_A_Predict - x_A_Now,
        y: y_A_Predict - y_A_Now,
        z: z_A_Predict - z_A_Now
    };

    // normalize moon direction
    // distance between the observer and the moon
    const norm_P_To_L = Math.sqrt(
        P_To_L.x ** 2 +
        P_To_L.y ** 2 +
        P_To_L.z ** 2
    )

    // keep only the direction
    const u_L = {
        x: P_To_L.x / norm_P_To_L,
        y: P_To_L.y / norm_P_To_L,
        z: P_To_L.z / norm_P_To_L
    };

    // Dot product: P_To_A_Now · u_L
    // how far the plane is already pointing towards the moon
    const P_To_A_Now_dot_u_L =
        P_To_A_Now.x * u_L.x +
        P_To_A_Now.y * u_L.y +
        P_To_A_Now.z * u_L.z;

    // Dot product: A_Now_To_A_Pred · u_L
    // indicates whether the aircraft is moving towards or away from the lunar direction.
    const A_Now_To_A_Pred_dot_u_L =
        A_Now_To_A_Pred.x * u_L.x +
        A_Now_To_A_Pred.y * u_L.y +
        A_Now_To_A_Pred.z * u_L.z;

    // time the plane is closest to the moon
    let t_closest;

    // handle cases where the result is almost zero
    const epsilon = 1e-10;

    if (Math.abs(A_Now_To_A_Pred_dot_u_L) < epsilon) {
        // Trajectory perpendicular to moon direction
        t_closest = 0;

    } else {
        // calculate the moment when the plane will be closest to the moon.
        const t_star = -60 * P_To_A_Now_dot_u_L / A_Now_To_A_Pred_dot_u_L;
        // limit the result between 0 and 60 seconds
        t_closest = Math.max(0, Math.min(60, t_star));
    }


    // Converts time into a ratio between 0 and 1.
    const t_ratio = t_closest / 60;

    // calculates the position of the plane at the moment when the plane is closest to the moon
    const P_To_A_At_t_closest = {
        x: P_To_A_Now.x + t_ratio * A_Now_To_A_Pred.x,
        y: P_To_A_Now.y + t_ratio * A_Now_To_A_Pred.y,
        z: P_To_A_Now.z + t_ratio * A_Now_To_A_Pred.z
    };

    // calculate the length of the observer vector
    const norm_P_To_A_At_t_closest = Math.sqrt(
        P_To_A_At_t_closest.x ** 2 +
        P_To_A_At_t_closest.y ** 2 +
        P_To_A_At_t_closest.z ** 2
    );

    // in order to calculate the angle between the two directions
    const dot_product =
        P_To_A_At_t_closest.x * P_To_L.x +
        P_To_A_At_t_closest.y * P_To_L.y +
        P_To_A_At_t_closest.z * P_To_L.z;

    // calculate the cosine of the angle between the two directions
    /*
    cos(0°) = 1 → same directions
    cos(90°) = 0 → perpendicular directions
    cos(180°) = -1 → opposite directions
    */
    const cos_theta = dot_product / (norm_P_To_A_At_t_closest * norm_P_To_L);


    // we force the value into the valid range
    const cos_theta_clamped = Math.max(-1, Math.min(1, cos_theta));

    // Calculate the angle in radians between the direction of the plane and the direction of the moon.
    const corner_O = Math.acos(cos_theta_clamped);

    const moonAngularRadius = 0.0045
    const closeTheMoon = 0.0135

    // Source : https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Map/has
    const key = `${flight.id}`

    const currentLog = logs.get(flight.id);

    if (corner_O <= moonAngularRadius) {
        if (!currentLog) {
            const closestDate = new Date(Date.now() + t_closest * 1000);
            const logTime = closestDate.toISOString();
            logs.set(key, `Aircraft pass in front of the moon | Camera : ${cameraPos} | Aircraft ID : ${flight.id} 
            | Time : ${logTime}`);
        }
    } else if (corner_O <= closeTheMoon) {
        // Source : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
        if (!currentLog || !currentLog.startsWith("Aircraft pass in front")) {
            const closestDate = new Date(Date.now() + t_closest * 1000);
            const logTime = closestDate.toISOString();
            logs.set(key, `Aircraft pass close to the moon | Camera : ${cameraPos} | Aircraft ID : ${flight.id} 
            | Time : ${logTime}`);
        }
    }
}

async function addNewPlanes(viewer, data){
    const airplaneUri = await Cesium.IonResource.fromAssetId(4359085);
    data.forEach(async (flight) => {
        if (viewer.entities.values.find(entity => entity.id.includes(flight.id)) === undefined){
            const positionProperty = new Cesium.SampledPositionProperty();
            const position = Cesium.Cartesian3.fromDegrees(flight.long, flight.lat, flight.alt)
            positionProperty.addSample(viewer.clock.currentTime, position);
            positionProperty.forwardExtrapolationType = Cesium.ExtrapolationType.HOLD
            positionProperty.backwardExtrapolationType = Cesium.ExtrapolationType.HOLD
            await loadModel(viewer, viewer.clock.currentTime, viewer.clock.stopTime, positionProperty, airplaneUri, flight.id)
            positionProperty.addSample(getNextTimeBySecond(viewer, 30), determinatePlane(flight))
        }
    })
}


// Source : https://developer.mozilla.org/en-US/docs/Web/API/Window/setInterval
setInterval(sendToLogFile,30000)