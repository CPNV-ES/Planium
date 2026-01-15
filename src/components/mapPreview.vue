<script setup>
import {VcViewer, VcCompass, VcNavigation, VcTerrainProviderCesium, VcLayerImagery, VcImageryProviderOsm} from "vue-cesium";
import {onMounted, ref, watch,watchEffect} from "vue";
const viewerRef = ref(null)
const isViewerReady = ref(false)
const cesiumToken = import.meta.env.VITE_CESIUM_ACCESS_TOKEN;
const viewer = ref()
const location = defineProps({
  lng: undefined,
  lat:  undefined
})


onMounted(() => {
  viewerRef.value.creatingPromise.then((readyObj) => {
    isViewerReady.value = true
  })

})

const onViewerReady = (readyObj) => {
  flyTo(readyObj, location.lat, location.lng)
  viewer.value = readyObj
}

watch(
    [() => location.lat, () => location.lng],
    ([newLat, newLng]) => {
      if (viewer.value && newLat && newLng) {
        flyTo(viewer.value, newLat, newLng)
      }
    }
)


function flyTo(readyObj, lat, lng){
try {

  readyObj.viewer.camera.flyTo({
    destination: readyObj.Cesium.Cartesian3.fromDegrees(
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

// MOON ASSET (insp. from https://cesium.com/platform/cesium-ion/content/cesium-moon/)
watchEffect(async () => { // wait for viewer to be ready before loading asset
  if (viewerRef.value) {
    try {
      // init Cesium and viewer from the component promise
      const { Cesium, viewer } = await viewerRef.value.creatingPromise;

      // FIX 2: Handle Lighting (so the moon isn't black)
      viewer.scene.globe.enableLighting = false;

      // FIX 3: Hide Earth imagery so it doesn't bleed through
      if (viewer.imageryLayers.length > 0) {
        viewer.imageryLayers.removeAll();
      }

      if (Cesium) {
        // clear previous tilesets
        viewer.scene.primitives.removeAll();
        // adjust light to see moon
        viewer.scene.globe.enableLighting = false;

        // load 3D tileset using Cesium Ion Asset ID
        const tileset = await Cesium.Cesium3DTileset.fromIonAssetId(2684829);
        console.log("Moon Tileset Loaded");

        // wait for tileset to be ready
        await tileset.readyPromise;

        // add 3D tileset to viewer
        viewer.scene.primitives.add(tileset);

        // relocate to default location
        const location = Cesium.Cartesian3.fromDegrees(
            6.583672,
            46.393440,
            5000 // 5km above ground
        );
        const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(location);

        // scale down to 0.1% of size (3.475km wide)
        const scale = 0.001;
        tileset.modelMatrix = Cesium.Matrix4.multiplyByUniformScale(
            modelMatrix,
            scale,
            new Cesium.Matrix4()
        );
      }
    } catch (error) {
      console.error("Error loading tileset:", error);
    }
  }
});
}

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

