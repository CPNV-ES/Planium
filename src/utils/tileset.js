export async function get3dTilesetById(id) {
   return await Cesium.Cesium3DTileset.fromIonAssetId(id)
}