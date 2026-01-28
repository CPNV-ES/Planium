export function flyTo(camera, cesium, lat, lng){
    try {
        camera.flyTo({
            destination: cesium.Cartesian3.fromDegrees(
                lng ??  6.500465335539498, // longitude is defaulted to Sainte-Croix if undefined
                lat ??46.82166054184684, //latitude is defaulted to Sainte-Croix if undefined
            ),
            orientation: {
                heading: Cesium.Math.toRadians(180.0), // Orientation to the south
                pitch: Cesium.Math.toRadians(15.0),
                roll: 0.0
            }
        })
    }
    catch(e) {
        console.log(e)
    }

}