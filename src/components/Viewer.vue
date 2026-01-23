<script setup>
import {VcViewer} from "vue-cesium";
import {nextTick, ref, watch} from "vue";
import {loadPlanes, movePlanes, prepareScene, removeMoving} from "@/utils/scene.js";
import Imagery from "@/components/imagery/Imagery.vue";
import {flyTo} from "@/utils/camera.js";
import Navigation from "@/components/navigation/Navigation.vue";
import Terrain from "@/components/terrain/Terrain.vue";
import Moon from "@/components/primitive/Moon.vue";
import MoonPhase from "@/components/MoonPhase.vue";
import MoonFocusButton from "@/components/primitive/MoonFocusButton.vue";
import CameraController from './CameraController.vue'
import CompassIndicator from '@/components/CompassIndicator.vue'

const viewerRef = ref(null)
const isViewerReady = ref(false)
const cesiumToken = import.meta.env.VITE_CESIUM_ACCESS_TOKEN;
const mapViewer = ref(null)
const cesium = ref(null)
const location = defineProps({
  lng: undefined,
  lat: undefined
})

const moonComponentRef = ref(null)

watch(
    [() => location.lat, () => location.lng],
    ([newLat, newLng]) => {
      if (mapViewer.value && newLat !== 0 && newLng !== 0) {
        flyTo(mapViewer.value.camera, cesium.value, newLat, newLng)
      } else {
        console.error(
            "Unable to update camera position: viewer is not ready or location is invalid.",
            {
              viewerReady: !!mapViewer.value,
              lat: newLat,
              lng: newLng
            }
        );
      }
    }
)


const onViewerReady = async ({Cesium, viewer}) => {
  isViewerReady.value = true
  window.cesiumViewer = viewer; // This makes it accessible in the console!
  window.CesiumGlobal = Cesium;

  if (viewerRef.value) {
    try {
      if (Cesium) {
        await prepareScene(viewer.scene)
        // removeMoving(viewer.scene)
      }
      viewer.scene.farToNearRatio = 1000000;
      viewer.scene.logarithmicDepthBuffer = true;
      await nextTick()
      if (moonComponentRef.value){
        console.log("Found Moon Component, initializing...");
        moonComponentRef.value.onViewerReady({Cesium, viewer})
      } else {
        console.error("Moon Component Ref is NULL. Check if Moon is inside a v-if.");
      }
      flyTo(viewer.camera, Cesium, location.lat, location.lng)
      mapViewer.value = viewer
      cesium.value = Cesium
      await loadPlanes(mapViewer.value)
      isViewerReady.value = true

      setInterval(async () => {
       await movePlanes(mapViewer.value)
      }, 30000)

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
      ref="viewerRef"
      :access-token="cesiumToken"
      @ready="onViewerReady">
    <template v-if="isViewerReady">
          <Imagery/>
          <Terrain/>
          <Navigation/>
      <Moon ref="moonComponentRef" />
      <MoonPhase v-bind="location" />
      <MoonFocusButton
          :cesiumViewer="mapViewer"
          :cesium="cesium"
          :moonComponent="moonComponentRef"
      />
    </template>
    <MoonPhase/>
  </vc-viewer>
  <CameraController v-if="isViewerReady" :viewer="mapViewer" />
  <CompassIndicator v-if="isViewerReady" :viewer="mapViewer" />
</template>

