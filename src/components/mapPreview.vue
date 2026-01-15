<script setup>
import {VcViewer, VcCompass, VcNavigation, VcTerrainProviderCesium, VcLayerImagery, VcImageryProviderOsm} from "vue-cesium";
import {ref, watch} from "vue";
import MapTerrain from "@/components/mapTerrain.vue";
const viewerRef = ref(null)
const isViewerReady = ref(false)
const cesiumToken = import.meta.env.VITE_CESIUM_ACCESS_TOKEN;
const Vcviewer = ref()
const cesium = ref()
const location = defineProps({
  lng: undefined,
  lat:  undefined
})




watch(
    [() => location.lat, () => location.lng],
    ([newLat, newLng]) => {
      if (Vcviewer.value && newLat != 0 && newLng != 0) {
        flyTo(Vcviewer.value,cesium.value, newLat, newLng)
      }else {
        //Throw error
      }
    }
)

const onViewerReady = async ({ Cesium, viewer }) => {

  if (viewerRef.value) {
    try {
      const { Cesium, viewer } = await viewerRef.value.creatingPromise;

      if (Cesium) {
        const tileset = await Cesium.Cesium3DTileset.fromIonAssetId(2684829);
        console.log("Moon Tileset Loaded");
      }
      flyTo(viewer, Cesium , location.lat, location.lng)
      isViewerReady.value = true
      Vcviewer.value = viewer
      cesium.value = Cesium

    } catch (error) {
      console.error("Error loading tileset:", error);
    }
  }
};

function flyTo(viewer, cesium, lat, lng){
try {
  viewer.camera.flyTo({
    destination: cesium.Cartesian3.fromDegrees(
        lng ?? 6.500465335539498, // longitude
        lat ?? 46.82166054184684, //latitude
        100, //height
    ),
    orientation: {
      heading: Cesium.Math.toRadians(0.0),
      pitch: Cesium.Math.toRadians(10.0),
      roll: 0.0
    }
  })
}
catch(e) {
  console.log(e)
}

}

</script>

<template>
  <vc-viewer :access-token="cesiumToken"
             ref="viewerRef"
             @ready="onViewerReady">
<!--      <vc-layer-imagery>-->
<!--        <vc-imagery-provider-osm>-->
<!--        </vc-imagery-provider-osm>-->
<!--      </vc-layer-imagery>-->
      <vc-imagery-provider-amap />
    <template v-if="isViewerReady">
      <vc-compass></vc-compass>
      <vc-navigation></vc-navigation>
      <MapTerrain :cesium="cesium"/>
    </template>
  </vc-viewer>

</template>

