<script setup>
import {VcViewer} from "vue-cesium";
import {nextTick, ref} from "vue";
import {
  loadPlanes,
  updatePlanes,
  prepareScene,
  removeMoving,
  sendToLogFile,
  checkIfPlaneIsCloseToTheMoon
} from "@/utils/scene.js";
import Imagery from "@/components/imagery/Imagery.vue";
import {flyTo} from "@/utils/camera.js";
import Navigation from "@/components/navigation/Navigation.vue";
import Terrain from "@/components/terrain/Terrain.vue";
import Moon from "@/components/primitive/Moon.vue";
import MoonPhase from "@/components/MoonPhase.vue";
import MoonCenterButton from "@/components/primitive/MoonCenterButton.vue";
import MoonMiniViewer from "@/components/MoonMiniViewer.vue"
import CameraController from './CameraController.vue'
import CompassIndicator from '@/components/CompassIndicator.vue'
import CoordinateForm from "@/components/CoordinateForm.vue";
import {getLocation} from "@/utils/api.js";

const viewerRef = ref(null)
const isViewerReady = ref(false)
const cesiumToken = import.meta.env.VITE_CESIUM_ACCESS_TOKEN;
const mapViewer = ref(null)
const cesium = ref(null)
const location = ref({
  lat: undefined,
  long: undefined
})
const planeData = ref([])
const moonComponentRef = ref(null)


const onViewerReady = async ({Cesium, viewer}) => {
  isViewerReady.value = true
  window.cesiumViewer = viewer; // This makes it accessible in the console!
  window.CesiumGlobal = Cesium;

  if (viewerRef.value) {
    try {
      if (Cesium) {
        await prepareScene(viewer.scene)
        removeMoving(viewer.scene)
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

      location.value = await getLocation(viewer)

      mapViewer.value = viewer
      cesium.value = Cesium

      flyTo(viewer.camera, Cesium, location.value.lat, location.value.long)
      await loadPlanes(mapViewer.value, location.value)
      isViewerReady.value = true

      setInterval(async () => {
        if (mapViewer.value !== undefined){
          await updatePlanes(mapViewer.value, location.value)
          await sendToLogFile()
        }
      }, 59000)

      setInterval(async () => {
        checkIfPlaneIsCloseToTheMoon(mapViewer.value)
      }, 30000)

    } catch (error) {
      console.error("Error loading tileset:", error);
    }
  }
};

async function onLocationSubmitted(e){
  if (!mapViewer.value || !cesium.value) {
    console.log("Viewer not ready yet. Please wait.");
    return;
  }
  try {
    flyTo(mapViewer.value.camera, cesium.value, e.lat, e.lng)
    location.value = {lat: e.lat, long: e.lng}
    await updatePlanes(mapViewer.value, location.value)
  } catch (e) {
    console.error("Flight failed:", e)
  }
}

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
      <MoonCenterButton
          :cesiumViewer="mapViewer"
          :cesium="cesium"
          :moonComponent="moonComponentRef"
      />
      <MoonMiniViewer
          v-if="cesium && mapViewer"
          :mainViewer="mapViewer"
          :Cesium="cesium"
          :moonPos="moonComponentRef?.moonPos"
          :planes="planeData"
      />
      <CameraController v-if="isViewerReady" :viewer="mapViewer" />
      <CompassIndicator v-if="isViewerReady" :viewer="mapViewer" />
      <CoordinateForm @submit="onLocationSubmitted"/>
    </template>
  </vc-viewer>
</template>

