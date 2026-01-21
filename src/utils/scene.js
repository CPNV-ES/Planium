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

    // disable scroll wheel zoom
    scene.screenSpaceCameraController.enableZoom = false;
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

    const url = "https://opensky-network.org/api/states/all?lamin=46.5&lomin=6.5&lamax=47.5&lomax=7.5";
    const airplaneUri = await Cesium.IonResource.fromAssetId(4359085);
    const response = await fetch(url);
    const data = {
        time: 1768771804,
        states: [
            ["4952d0", "TAP556  ", "Portugal", 1768771803, 1768771804, 7.0329, 46.6013, 11582.48, false, 217.97, 60.29, 0, null, 11490.96, "2276", false, 0],
            ["3c65c8", "DLH44X  ", "Germany", 1768771803, 1768771803, 7.3766, 46.8955, 11871.96, false, 220.15, 239.84, 0, null, 11772.9, "1000", false, 0],
            ["440036", "EJU47NM ", "Austria", 1768771803, 1768771803, 7.4283, 47.0293, 7917.18, false, 210.5, 231.45, 9.43, null, 7962.9, "3062", false, 0],
            ["4b027c", "EJU58HR ", "Switzerland", 1768771803, 1768771803, 7.2721, 46.9609, 4800.6, false, 174.94, 1.0, -7.8, null, 4892.04, "1000", false, 0]
        ]
    };
    // const data = await response.json();
    const formattedFlights = data.states.map(flight => {
        return {
            callsign: flight[1].trim(), // Nom de l'avion
            longitude: flight[5],             // Longitude
            latitude: flight[6],             // Latitude
            height: flight[7]           // Hauteur (Altitude)
        };
    });


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
    viewer.clock.multiplier = 2;
    // Start playing the scene.
    viewer.clock.shouldAnimate = true;

    // The SampledPositionedProperty stores the position and timestamp for each sample along the radar sample series.

    for (let i = 0; i < formattedFlights.length; i++) {
        const positionProperty = new Cesium.SampledPositionProperty();

        const dataPoint = formattedFlights[i];

        // Declare the time for this individual sample and store it in a new JulianDate instance.
        const time = Cesium.JulianDate.addSeconds(start, i * timeStepInSeconds, new Cesium.JulianDate());

        const position = Cesium.Cartesian3.fromDegrees(dataPoint.longitude, dataPoint.latitude, dataPoint.height);
        // Store the position along with its timestamp.
        // Here we add the positions all upfront, but these can be added at run-time as samples are received from a server.
        positionProperty.addSample(time, position);

        viewer.entities.add({
            description: `Location: (${dataPoint.longitude}, ${dataPoint.latitude}, ${dataPoint.height})`,
            position: position,
            point: { pixelSize: 10, color: Cesium.Color.RED }
        });

           await loadModel(viewer, start, stop, position, airplaneUri);

    }



}

async function loadModel(viewer, start, stop, positionProperty, airplaneUri) {
    // Load the glTF model from Cesium ion.
    const airplaneEntity = viewer.entities.add({
        // availability: new Cesium.TimeIntervalCollection([ new Cesium.TimeInterval({ start: start, stop: stop }) ]),
        position: positionProperty,
        // Attach the 3D model instead of the green point.
        model: { uri: airplaneUri,minimumPixelSize: 200  },
        // Automatically compute the orientation from the position.
        // orientation: new Cesium.VelocityOrientationProperty(positionProperty),
        path: new Cesium.PathGraphics({ width: 3 })
    });

    // viewer.trackedEntity = airplaneEntity;
}

