<script setup>
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
  mainViewer: Object, // pass main Cesium.Viewer object
  Cesium: Object,     // pass Cesium library
  moonPos: Object     // pass Moon position
});

const miniViewerContainer = ref(null);
let miniViewer = null;

onMounted(() => {
  miniViewer = new props.Cesium.Viewer(miniViewerContainer.value, {
    sceneMode: props.Cesium.SceneMode.SCENE3D,
    navigationHelpButton: false,
    animation: false,
    timeline: false,
    fullscreenButton: false,
    geocoder: false,
    baseLayerPicker: false,
    homeButton: false,
    infoBox: false,
    selectionIndicator: false,
    sceneModePicker: false,
    creditContainer: document.createElement('div'), // hide credits
  })

  miniViewer.scene.backgroundColor = props.Cesium.Color.BLACK
  miniViewer.scene.logarithmicDepthBuffer = true
  miniViewer.scene.light = props.mainViewer.scene.light

  miniViewer.scene.screenSpaceCameraController.enableRotate = false;
  miniViewer.scene.screenSpaceCameraController.enableTranslate = false;
  miniViewer.scene.screenSpaceCameraController.enableZoom = false;

  props.mainViewer.camera.changed.addEventListener(updateMiniView)
})

watch(() => props.moonPos, () => {
  updateMiniView()
}, {deep: true})


function updateMiniView() {
  if (!props.moonPos || !miniViewer) return

  const Cesium = props.Cesium
  const mainCamera = props.mainViewer.camera

  const moonRadius = 1737400 // 10 Moons
  const viewWidthMeters = moonRadius * 20
  const fov = miniViewer.camera.frustum.fov || Math.PI / 3
  const distance = (viewWidthMeters / 2) / Math.tan(fov / 2)

  miniViewer.camera.lookAt(
      props.moonPos,
      new Cesium.HeadingPitchRange(
          mainCamera.heading,
          mainCamera.pitch,
          distance
      )
  )
}
</script>

<template>
  <div class="telescope-container">
    <div ref="miniViewerContainer" class="mini-moon-viewer"></div>
    <div class="overlay"></div>
  </div>
</template>

<style scoped>
.telescope-container {
  position: absolute;
  bottom: 24px;
  left: 24px;
  width: 200px;
  height: 200px;
  z-index: 2000;
  pointer-events: none;
}
.mini-moon-viewer {
  position: absolute;
  bottom: 20px;
  left: 20px;
  width: 400px;
  height: 400px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  overflow: hidden;
  z-index: 2000;
}
.overlay {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  border-radius: 50%;
  background-image:
      linear-gradient(to right, transparent 49.5%, rgba(255,255,255,0.2) 50%, transparent 50.5%),
      linear-gradient(to bottom, transparent 49.5%, rgba(255,255,255,0.2) 50%, transparent 50.5%);
}
</style>