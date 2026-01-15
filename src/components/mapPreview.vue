<script setup>
import {VcViewer, VcCompass, VcNavigation, VcTerrainProviderCesium, VcLayerImagery, VcImageryProviderOsm} from "vue-cesium";
import {onMounted, ref, watchEffect} from "vue";
const viewerRef = ref(null)
const isViewerReady = ref(false)

const cesiumToken = import.meta.env.VITE_CESIUM_ACCESS_TOKEN;

const props = defineProps({
  lng: 46.82166054184684,
  lat:  6.500465335539498
})

onMounted(() => {
  viewerRef.value.creatingPromise.then((readyObj) => {
    isViewerReady.value = true
  })

})

const onViewerReady = (readyObj) => {
  readyObj.viewer.camera.flyTo({
    destination: readyObj.Cesium.Cartesian3.fromDegrees(
        6.500465335539498, // longitude
        46.82166054184684, //latitude
        100, //height
    ),
    orientation: {
      heading: Cesium.Math.toRadians(10.0),
      pitch: Cesium.Math.toRadians(10.0),
      roll: 0.0
    }
  })
}

// MOON ASSET
watchEffect(async () => { // wait for viewer to be ready before loading asset
  if (viewerRef.value) {
    try {
      // init Cesium and viewer from the component promise
      const { Cesium, viewer } = await viewerRef.value.creatingPromise;

      if (Cesium) {
        // clear previous tilesets
        viewer.scene.primitives.removeAll();
        // load 3D tileset using Cesium Ion Asset ID
        const tileset = await Cesium.Cesium3DTileset.fromIonAssetId(2684829);
        // add 3D tileset to viewer
        viewer.scene.primitives.add(tileset);
        // zoom to tileset
        viewer.zoomTo(tileset);

        console.log("Moon Tileset Loaded");
      }
    } catch (error) {
      console.error("Error loading tileset:", error);
    }
  }
});

</script>

<template>

  <vc-viewer :access-token="cesiumToken"
             ref="viewerRef"
             @ready="onViewerReady">
      <vc-layer-imagery>
        <vc-imagery-provider-osm>

        </vc-imagery-provider-osm>
      </vc-layer-imagery>
      <vc-imagery-provider-amap />
    <template v-if="isViewerReady">
      <vc-compass></vc-compass>
      <vc-navigation></vc-navigation>
      <vc-terrain-provider-cesium></vc-terrain-provider-cesium>
    </template>
  </vc-viewer>

</template>

