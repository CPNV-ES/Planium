<script setup>
import {computed, onMounted, onUnmounted, ref, watch} from 'vue';
import {loadPlanes, updatePlanes} from "@/utils/scene.js";

// data from Viewer.vue
const props = defineProps({
  mainViewer: Object, // pass main Cesium.Viewer (3D map)
  Cesium: Object,     // pass Cesium library
  moonPos: Object,    // pass Moon position (cartesian)
  planes: Array       // pass plane data
});

const miniViewerContainer = ref(null);
let miniViewer = null;
let syncLayers = null;

const moonRadius = 1737400 // meters
const moonWidthMultiplier = ref(6); // zoom width (Moon's diameters, default: 6 Moons)

const reticleStyle = computed(() => { // adjust reticle to moon's size
  const size = (400 / moonWidthMultiplier.value) + 2; // proportion (ex. 2 Moons wide, reticle = 202x202px)
  return {
    width: `${size}px`,
    height: `${size}px`
  };
});

// point miniViewer's camera to Moon reactively
function updateMiniView() {
  if (!props.moonPos || !miniViewer || !miniViewer.scene || miniViewer.isDestroyed() || !props.mainViewer.camera.position) return

  const Cesium = props.Cesium
  const mainCamera = props.mainViewer.camera

  // calculate direction vector from main camera to Moon
  const moonDirection = Cesium.Cartesian3.subtract(props.moonPos, mainCamera.position, new Cesium.Cartesian3());
  const distanceToMoon = Cesium.Cartesian3.magnitude(moonDirection);
  Cesium.Cartesian3.normalize(moonDirection, moonDirection);

  // set miniViewer's camera to same position as mainCamera but pointing the Moon
  miniViewer.camera.setView({
    destination: mainCamera.position,
    orientation: {
      direction: moonDirection,
      up: mainCamera.up
    }
  });

  // sync clock to mainViewer's
  miniViewer.clock.currentTime = props.mainViewer.clock.currentTime;

  // calculate Moon's angular width
  // opp side: moonRadius, adj side: distanceToMoon, angle: half Moon
  // tan = opp/adj, angle = inverse tan (atan)
  // multiply by 2 to get full width
  const moonAngularSize = 2 * Math.atan(moonRadius / distanceToMoon)
  miniViewer.camera.frustum.fov = moonAngularSize * moonWidthMultiplier.value // adjust "Field of View" to zoom
}

onMounted(async () => {
  const { Cesium, mainViewer } = props;

  // initialize miniViewer
  miniViewer = new Cesium.Viewer(miniViewerContainer.value, {
    sceneMode: Cesium.SceneMode.SCENE3D,
    terrainProvider: mainViewer.terrainProvider,
    creditContainer: document.createElement('div'), // hide credits
    // hide default UI
    animation: false, timeline: false, geocoder: false, homeButton: false,
    infoBox: false, selectionIndicator: false, navigationHelpButton: false,
    sceneModePicker: false, fullscreenButton: false, baseLayerPicker: false,
  })


  const scene = miniViewer.scene
  scene.backgroundColor = Cesium.Color.TRANSPARENT; // allow sight of atmosphere colors
  scene.logarithmicDepthBuffer = true;  // improve long distance render (logarithmic depth)
  scene.screenSpaceCameraController.enableInputs = false; // fixed view (disable inputs on mini viewer)


  // safe prevention to 'rectangles error' (when Cesium tries rendering a layer before ImageryProvider is ready)
  syncLayers = () => {
    // with GEMINI
    try{
      if (mainViewer.imageryLayers.length > 0) {
        const primaryLayer = mainViewer.imageryLayers.get(0) // first layer (base layer)

        // only add ImageryProvider if it exists and isn't null or undefined
        if (primaryLayer?.imageryProvider) {
          const provider = primaryLayer.imageryProvider
          miniViewer.imageryLayers.removeAll()
          miniViewer.imageryLayers.addImageryProvider(provider)
        }
      }
    } catch (e) {
        console.error("Layer error: ", e)
    }
  }
  // layer sync : react to map changes
  syncLayers()
  mainViewer.imageryLayers.layerAdded.addEventListener(syncLayers);

  miniViewer.clock.currentTime = mainViewer.clock.currentTime; // sync clock
  mainViewer.camera.changed.addEventListener(updateMiniView) // sync camera
  await loadPlanes(miniViewer)  // load plane assets
})

onUnmounted(() => {
  // GEMINI
  if (miniViewer) {
    // remove listeners to prevent memory leaks
    props.mainViewer.camera.changed.removeEventListener(updateMiniView);
    if (syncLayers) {
      props.mainViewer.imageryLayers.layerAdded.removeEventListener(syncLayers)
    }
    miniViewer.destroy();
  }
});

// react to user's miniViewer zoom
watch(moonWidthMultiplier, updateMiniView);
// react to Moon position
watch(() => props.moonPos, updateMiniView, { deep: true });
// react to planes data
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
/* absolute positions for containers and reticle */
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