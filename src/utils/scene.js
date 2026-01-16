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