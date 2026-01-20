export async function get3dTilesetById(id) {
   return await Cesium.Cesium3DTileset.fromIonAssetId(id)
}

export async function getTilesetCartesian(){
    return {x:-24,y: 12, z:45}
}
