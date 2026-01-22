import {getFLights} from "@/utils/api.js";

export async function prepareScene(scene){
    //------------Uncomment if performance is low---------------------
    // scene.requestRenderMode = true; // Ne rendu que si nécessaire
    // scene.maximumRenderTimeChange = Infinity;
    // scene.globe.maximumScreenSpaceError = 24; // AUGMENTE CETTE VALEUR (16 à 32) pour réduire les requêtes
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

}

export function addTilesetToScene(scene, tileset){
    try {
        scene.primitives.add(tileset);
    }catch{
        console.log("Error adding tileset")
    }

}

//Prevent the user to move in the scene
export function removeMoving(scene){
    scene.screenSpaceCameraController.enableRotate = false;
}
export async function loadPlanes(viewer){
    const airplaneUri = await Cesium.IonResource.fromAssetId(4359085);
    const data = await getFLights('http://localhost:8080/flights', {long:6.500465335539498 , lat: 46.82166054184684})

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
        viewer.clock.stopTime = stop.clone();
        viewer.clock.currentTime = start.clone();

        // viewer.timeline.zoomTo(start, stop);
        // Speed up the playback speed 50x.
        viewer.clock.multiplier = 2;
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

            viewer.entities.add({
                description: `Location: (${flight.long}, ${flight.lat}, ${flight.alt})`,
                position: position,
                point: {pixelSize: 10, color: Cesium.Color.RED}
            });

            await loadModel(viewer, start, stop, positionProperty, airplaneUri, flight.id);

        }
    }


}

async function loadModel(viewer, start, stop, positionProperty, airplaneUri, id) {
    // Load the glTF model from Cesium ion.
    const airplaneEntity = viewer.entities.add({
        id: id,
        availability: new Cesium.TimeIntervalCollection([ new Cesium.TimeInterval({ start: start, stop: stop }) ]),
        // position: positionProperty,
        position: positionProperty,
        // Attach the 3D model instead of the green point.
        model: {uri: airplaneUri,minimumPixelSize: 200  },
        // Automatically compute the orientation from the position.
        orientation: new Cesium.VelocityOrientationProperty(positionProperty),
        path: new Cesium.PathGraphics({ width: 3 })
    });

    // viewer.trackedEntity = airplaneEntity;
}

export async function movePlanes(viewer){

    const data = await getFLights('http://localhost:8080/flights', {long:6.500465335539498 , lat: 46.82166054184684})

    if (data !== undefined) {
        data.forEach(flight => {
            let entity = viewer.entities.values.find((element) => element.id === flight.id)
            const time = Cesium.JulianDate.now();
            const nextPos = Cesium.Cartesian3.fromDegrees(flight.long, flight.lat, flight.alt)
            viewer.entities.add({
                description: `Location: (${flight.long}, ${flight.lat}, ${flight.alt})`,
                position: nextPos,
                point: {pixelSize: 10, color: Cesium.Color.RED},
                orientation: new Cesium.VelocityOrientationProperty(nextPos)
            });

            entity.position.addSample(time, nextPos)
        })
    }
}

function addNextPostion(){

}

