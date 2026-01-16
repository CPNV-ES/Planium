<script setup>
import {VcViewer} from "vue-cesium";
import {ref, watch} from "vue";
import {prepareScene, removeMoving} from "@/utils/scene.js";
import Imagery from "@/components/imagery/Imagery.vue";
import Tilesets from "@/components/primitive/Tilesets.vue";
import {flyTo} from "@/utils/camera.js";
import Navigation from "@/components/navigation/Navigation.vue";
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
        flyTo(Vcviewer.value.camera,cesium.value, newLat, newLng)
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
        viewer.scene.requestRenderMode = true; // Ne rendu que si nécessaire
        viewer.scene.maximumRenderTimeChange = Infinity;
        viewer.scene.globe.maximumScreenSpaceError = 24; // AUGMENTE CETTE VALEUR (16 à 32) pour réduire les requêtes
        viewer.scene.globe.tileCacheSize = 1000;
        viewer.scene.globe.preloadAncestors = false;
        await prepareScene(viewer.scene)
        removeMoving(viewer.scene)
      }

      flyTo(viewer.camera, Cesium , location.lat, location.lng)
      isViewerReady.value = true
      Vcviewer.value = viewer
      cesium.value = Cesium

    } catch (error) {
      console.error("Error loading tileset:", error);
    }
  }
};


</script>

<template>
  <vc-viewer
      :showCredit="false"
      :enableMouseEvent="false"
      :scene3DOnly="true"
      :access-token="cesiumToken"
             ref="viewerRef"
             @ready="onViewerReady">

    <template v-if="isViewerReady">
      <Imagery/>
      <Tilesets/>
      <Navigation/>
      <!--      Suspense wait for the different async call inside each component-->
      <Suspense>
        <Tilesets/>
        <template #fallback>
          <div>Loading...</div>
        </template>
      </Suspense>

    </template>
  </vc-viewer>

</template>

