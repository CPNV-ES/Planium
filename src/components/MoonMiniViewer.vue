<script setup>
import {ref, onMounted, watch, onUnmounted} from 'vue';
import {loadPlanes} from "@/utils/scene.js";

const props = defineProps({
  mainViewer: Object, // pass main Cesium.Viewer object
  Cesium: Object,     // pass Cesium library
  moonPos: Object,    // pass Moon position
  planes: Array       // pass plane data
});

const miniViewerContainer = ref(null);
let miniViewer = null;
let moonHighlight = null;

onMounted(async () => {
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
    terrainProvider: props.mainViewer.terrainProvider,
    skyAtmosphere: true,
    creditContainer: document.createElement('div'), // hide credits
  })

  const mainLayers = props.mainViewer.imageryLayers
  for (let i = 0; i < mainLayers.length; i++) {
    const layer = mainLayers.get(i)
    miniViewer.imageryLayers.addImageryProvider(layer.imageryProvider)
  }

  miniViewer.scene.skyAtmosphere = props.mainViewer.scene.skyAtmosphere
  miniViewer.scene.fog = props.mainViewer.scene.fog

  miniViewer.scene.backgroundColor = props.Cesium.Color.BLACK
  miniViewer.scene.logarithmicDepthBuffer = true
  miniViewer.scene.light = props.mainViewer.scene.light
  miniViewer.scene.globe.enableLighting = true

  miniViewer.scene.screenSpaceCameraController.enableRotate = false;
  miniViewer.scene.screenSpaceCameraController.enableTranslate = false;
  miniViewer.scene.screenSpaceCameraController.enableZoom = false;

  moonHighlight = miniViewer.entities.add({
    id: 'moon-xray-border',
    position: props.moonPos,
    point: {
      pixelSize: 1,
      color: props.Cesium.Color.TRANSPARENT,
      outlineColor: props.Cesium.Color.YELLOW.withAlpha(0.8),
      outlineWidth: 2,
      disableDepthTestDistance: Number.POSITIVE_INFINITY
    }
  });

  props.mainViewer.camera.changed.addEventListener(updateMiniView)

  window.miniViewerInstance = miniViewer

  await loadPlanes(miniViewer)
})

onUnmounted(() => {
  window.miniViewerInstance = null;
});

watch(() => props.moonPos, (newPos) => {
  if (moonHighlight && newPos) {
    moonHighlight.position = newPos
  }
  updateMiniView()
}, {deep: true})

watch(() => props.planes, async (newData) => {
  if (miniViewer && newData.length > 0) {
    const { updatePlanes } = await import("@/utils/scene.js");
    await updatePlanes(miniViewer, newData);

    /*
    // --- SYNC DEBUG LOGS ---
    const mainCount = props.mainViewer.entities.values.filter(e => e.id !== 'Moon').length;
    const miniCount = miniViewer.entities.values.filter(e => e.id !== 'moon-xray-border' && e.id !== 'Moon').length;

    console.group('✈️ Plane Sync Check');
    console.log(`Main Viewer Planes: ${mainCount}`);
    console.log(`Mini Viewer Planes: ${miniCount}`);

    if (mainCount === miniCount) {
      console.log('%c✅ Sync OK', 'color: green; font-weight: bold;');
    } else {
      console.warn('%c❌ Sync Mismatch!', 'color: orange; font-weight: bold;');
      // Optional: Check if a specific ID exists in both
      if (newData.length > 0) {
        const testId = newData[0].id;
        const inMain = !!props.mainViewer.entities.getById(testId);
        const inMini = !!miniViewer.entities.getById(testId);
        console.log(`Test Flight [${testId}] -> Main: ${inMain}, Mini: ${inMini}`);
      }
    }
    console.groupEnd();
    // ------------------
    */
  }
}, { deep: true });

function updateMiniView() {
  if (!props.moonPos || !miniViewer) return

  const Cesium = props.Cesium
  const mainCamera = props.mainViewer.camera

  if (moonHighlight) {
    moonHighlight.position = props.moonPos
  }

  const moonDirection = new Cesium.Cartesian3()
  Cesium.Cartesian3.subtract(props.moonPos, mainCamera.position, moonDirection);

  const distanceToMoon = Cesium.Cartesian3.magnitude(moonDirection);
  if (distanceToMoon <= 0) return;

  Cesium.Cartesian3.normalize(moonDirection, moonDirection);

  const up = mainCamera.up
  const right = new Cesium.Cartesian3()
  Cesium.Cartesian3.cross(moonDirection, up, right)
  Cesium.Cartesian3.normalize(right, right)

  const actualUp = new Cesium.Cartesian3()
  Cesium.Cartesian3.cross(right, moonDirection, actualUp)
  Cesium.Cartesian3.normalize(actualUp, actualUp)

  miniViewer.camera.setView({
    destination: mainCamera.position,
    orientation: {
      direction: moonDirection,
      up: actualUp
    }
  });

  const moonRadius = 1737400 // 10 Moons
  const moonAngularSize = 2 * Math.atan(moonRadius / distanceToMoon)

  const currentFov = moonAngularSize * 10
  miniViewer.camera.frustum.fov = currentFov

  const viewerHeight = 400
  const moonPixelDiameter = (moonAngularSize / currentFov) * viewerHeight

  if (moonHighlight && moonHighlight.point){
    moonHighlight.point.pixelSize =  moonPixelDiameter
  }
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
  mask-image: radial-gradient(circle, white 100%, black 100%);
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