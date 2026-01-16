export async function get3dTilesetById(id) {
   return await Cesium.Cesium3DTileset.fromIonAssetId(id)
}

export async function getTilesetCartesian(){
    return {x:-29,y: 8, z:25}
}