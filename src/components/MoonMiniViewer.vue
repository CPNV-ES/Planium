<script setup>
import {computed, onMounted, onUnmounted, ref, watch} from 'vue';
import {loadPlanes, updatePlanes} from "@/utils/scene.js";

const props = defineProps({
  mainViewer: Object, // pass main Cesium.Viewer object
  Cesium: Object,     // pass Cesium library
  moonPos: Object,    // pass Moon position
  planes: Array       // pass plane data
});

const miniViewerContainer = ref(null);
let miniViewer = null;
let syncLayers = null;

const moonRadius = 1737400 // meters
const moonWidthMultiplier = ref(6); // width multiplier (in Moon's diameter, default: 6 Moons)

const reticleStyle = computed(() => { // adjust reticle to moon's size
  const size = (400 / moonWidthMultiplier.value) + 2;
  return {
    width: `${size}px`,
    height: `${size}px`
  };
});

function updateMiniView() {
  if (!props.moonPos || !miniViewer || !props.mainViewer.camera.position) return

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

  const moonAngularSize = 2 * Math.atan(moonRadius / distanceToMoon) // Moon diameter
  miniViewer.camera.frustum.fov = moonAngularSize * moonWidthMultiplier.value // zoom width in Moons (diameter)
}

onMounted(async () => {
  const { Cesium, mainViewer } = props;

  miniViewer = new Cesium.Viewer(miniViewerContainer.value, {
    sceneMode: Cesium.SceneMode.SCENE3D,
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
    baseLayer: false
  })

  syncLayers = () => {
    if (mainViewer.imageryLayers.length > 0) {
      const primaryLayer = mainViewer.imageryLayers.get(0);

      // The Critical Guard: Ensure provider exists AND is ready
      if (primaryLayer && primaryLayer.imageryProvider) {
        try {
          miniViewer.imageryLayers.removeAll();
          miniViewer.imageryLayers.addImageryProvider(primaryLayer.imageryProvider);
        } catch (e) {
          console.warn("Imagery provider not quite ready for rectangles:", e);
        }
      }
    }
  }

  syncLayers()
  mainViewer.imageryLayers.layerAdded.addEventListener(syncLayers);

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

    if (syncLayers) {
      props.mainViewer.imageryLayers.layerAdded.removeEventListener(syncLayers)
    }

    miniViewer.destroy();
  }
});

watch(moonWidthMultiplier, updateMiniView);

watch(() => props.moonPos, updateMiniView, { deep: true });

watch(() => props.planes, (newData) => {
  if (miniViewer) updatePlanes(miniViewer, newData);
}, { deep: true });

</script>

<template>
  <div class="telescope-container">
    <div ref="miniViewerContainer" class="mini-moon-viewer">
      <div class="reticle-ring" :style="reticleStyle"></div>
    </div>
    <div class="zoom-controls">
      <div class="labels">
        <label class="zoom-label">ZOOM </label>
        <label class="zoom-sub">(Moon diameters): </label>
      </div>

      <input
        type="range"
        v-model.number="moonWidthMultiplier"
        min="2"
        max="20"
        step="1"
      />

      <span class="zoom-value">{{ moonWidthMultiplier }}</span>
    </div>
  </div>
</template>

<style scoped>
.telescope-container {
  position: absolute;
  bottom: 24px;
  left: 24px;
  width: 440px;
  height: 440px;
  z-index: 2000;
  pointer-events: none;
}
.mini-moon-viewer {
  position: absolute;
  bottom: 50px;
  left: 20px;
  width: 400px;
  height: 400px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  overflow: hidden;
  z-index: 2000;
  mask-image: radial-gradient(circle, white 100%, black 100%);
}
.reticle-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 2px solid yellow;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(255, 255, 0, 0.8);
  opacity: 0.8;
  z-index: 2001;
}
.zoom-controls {
  position: absolute;
  bottom: 10px;
  left: 60px;
  width: 300px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
  background: rgba(0, 0, 0, 0.0);
  pointer-events: auto;
  text-shadow: 1px 1px 2px black;
  padding: 10px;
}
.labels{
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.1;
}
.zoom-label{
  font-weight: bold;
  font-size: 14px;
  color: #fff;
}
.zoom-sub{
  font-size: 9px;
  color:#fff;
  text-transform: uppercase;
}
input[type="range"] {
  flex-grow: 1;
  cursor: pointer;
  accent-color: white;
}
.zoom-value {
  font-size: 16px;
  min-width: 30px;
  font-weight: bold;
  color: white;
  text-align: right;
}
</style>