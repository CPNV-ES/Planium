<script setup>
import {onMounted, onUnmounted, ref, watch} from 'vue';
import {loadPlanes, updatePlanes} from "@/utils/scene.js";

const props = defineProps({
  mainViewer: Object, // pass main Cesium.Viewer object
  Cesium: Object,     // pass Cesium library
  moonPos: Object,    // pass Moon position
  planes: Array       // pass plane data
});

const miniViewerContainer = ref(null);
let miniViewer = null;

const moonRadius = 1737400 // meters

function updateMiniView() {
  if (!props.moonPos || !miniViewer) return

  const Cesium = props.Cesium
  const mainCamera = props.mainViewer.camera

  const moonDirection = Cesium.Cartesian3.subtract(props.moonPos, mainCamera.position, new Cesium.Cartesian3());
  const distanceToMoon = Cesium.Cartesian3.magnitude(moonDirection);
  Cesium.Cartesian3.normalize(moonDirection, moonDirection);

  miniViewer.camera.setView({
    destination: mainCamera.position,
    orientation: {
      direction: moonDirection,
      up: mainCamera.up
    }
  });

  const moonAngularSize = 2 * Math.atan(moonRadius / distanceToMoon)
  miniViewer.camera.frustum.fov = moonAngularSize * 15 // zoom width in Moons (diameter)
}

onMounted(async () => {
  const { Cesium, mainViewer } = props;

  miniViewer = new Cesium.Viewer(miniViewerContainer.value, {
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
    terrainProvider: mainViewer.terrainProvider,
    creditContainer: document.createElement('div'), // hide credits
  })

  const mainLayers = mainViewer.imageryLayers;
  if (mainViewer.imageryLayers.length > 0) {
    miniViewer.imageryLayers.removeAll();
    const primaryLayer = mainViewer.imageryLayers.get(0);
    if (primaryLayer?.imageryProvider) {
      miniViewer.imageryLayers.addImageryProvider(primaryLayer.imageryProvider);
    }
  }

  const scene = miniViewer.scene
  scene.backgroundColor = props.Cesium.Color.BLACK
  scene.logarithmicDepthBuffer = true
  scene.light = mainViewer.scene.light
  scene.globe.enableLighting = true

  scene.screenSpaceCameraController.enableInputs = false;

  mainViewer.camera.changed.addEventListener(updateMiniView)

  await loadPlanes(miniViewer)
})

onUnmounted(() => {
  if (miniViewer) {
    props.mainViewer.camera.changed.removeEventListener(updateMiniView);
    miniViewer.destroy();
  }
});

watch(() => props.moonPos, updateMiniView, { deep: true });

watch(() => props.planes, (newData) => {
  if (miniViewer) updatePlanes(miniViewer, newData);
}, { deep: true });

</script>

<template>
  <div class="telescope-container">
    <div ref="miniViewerContainer" class="mini-moon-viewer">
      <div class="reticle-ring"></div>
    </div>
  </div>
</template>

<style scoped>
.telescope-container {
  position: absolute;
  bottom: 24px;
  left: 24px;
  width: 400px;
  height: 400px;
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
  mask-image: radial-gradient(circle, white 100%, black 100%);
}
.reticle-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 27px;
  height: 27px;
  border: 2px solid yellow;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(255, 255, 0, 0.8);
  opacity: 0.8;
  z-index: 2001;
}
</style>