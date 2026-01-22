<template>
  <div class="compass-container">
    <!-- Direction display box -->
    <div class="direction-info">
      <div class="cardinal-direction">{{ cardinalDirection }}</div>
      <div class="degree-value">{{ Math.round(heading) }}°</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import * as Cesium from 'cesium';

const props = defineProps({
  viewer: {
    type: Object,
    required: true
  }
});

const heading = ref(0);
const pitch = ref(0);

// Convert heading to cardinal direction
const cardinalDirection = computed(() => {
  const h = heading.value;

  if (h >= 337.5 || h < 22.5) return 'Nord';
  if (h >= 22.5 && h < 67.5) return 'Nord-Est';
  if (h >= 67.5 && h < 112.5) return 'Est';
  if (h >= 112.5 && h < 157.5) return 'Sud-Est';
  if (h >= 157.5 && h < 202.5) return 'Sud';
  if (h >= 202.5 && h < 247.5) return 'Sud-Ouest';
  if (h >= 247.5 && h < 292.5) return 'Ouest';
  if (h >= 292.5 && h < 337.5) return 'Nord-Ouest';

  return 'Nord';
});

let cameraChangeListener;

const updateOrientation = () => {
  if (props.viewer?.camera) {
    heading.value = Cesium.Math.toDegrees(props.viewer.camera.heading);
    pitch.value = Cesium.Math.toDegrees(props.viewer.camera.pitch);

    // Normalize heading between 0 and 360
    if (heading.value < 0) {
      heading.value += 360;
    }
  }
};

onMounted(() => {
  if (props.viewer?.camera) {
    // Initial update
    updateOrientation();

    // Listen to camera changes
    cameraChangeListener = props.viewer.camera.changed.addEventListener(updateOrientation);
  }
});

onUnmounted(() => {
  // Clean up event listener
  if (cameraChangeListener) {
    cameraChangeListener();
  }
});
</script>

<style scoped>
.compass-container {
  position: absolute;
  top: 0.5rem;
  left: 65%;
  transform: translateX(-50%);
  z-index: 1000;
  pointer-events: none;
}

.direction-info {
  background: rgba(255, 255, 255, 0.95);
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  text-align: center;
  min-width: 120px;
}

.cardinal-direction {
  font-weight: bold;
  font-size: 18px;
  color: #2c3e50;
  margin-bottom: 4px;
}

.degree-value {
  font-size: 14px;
  color: #7f8c8d;
}
</style>