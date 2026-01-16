export async function prepareScene(scene){
    scene.primitives.removeAll();
    scene.contextOptions = {
        allowTextureFilterAnisotropic: false,
        cameraUnderground: false
    }
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
