<script setup>
import { ref } from "vue";

// data received from parent (Viewer.vue)
const props = defineProps({
  cesiumViewer: Object,
  cesium: Object,
  moonComponent: Object,
});

// runs when "Center Moon" button is clicked
function onClick() {
  // check missing objects, exit if one or more missing
  if (!props.cesiumViewer || !props.cesium || !props.moonComponent?.moonPos) {
    console.log("Viewer, Cesium, or Moon position not ready");
    return;
  }

  // locally store camera and moonPos objects for reference
  const camera = props.cesiumViewer.camera;
  const moonPos = props.moonComponent.moonPos;

  // check moonPos state (must not be null or undefined)
  if (!moonPos) {
    console.log("Moon position is null");
    return;
  }

  // get current camera position to ensure it stays the same when camera is redirected
  const camPos = props.cesium.Cartesian3.clone(camera.position);

  // direction vector calculus (heading the Moon)
  // subtract camPos from moonPos to get vector pointing from camera to Moon
  // normalize vector (length to 1 = unit vector)
  const direction = props.cesium.Cartesian3.normalize(
      props.cesium.Cartesian3.subtract(moonPos, camPos, new props.cesium.Cartesian3()),
      new props.cesium.Cartesian3()
  );

  // get camera's current up vector, if not, use cesium's unit Z vector
  const up = camera.up || props.cesium.Cartesian3.UNIT_Z;

  // fly camera to current position with orientation to the moon
  camera.flyTo({
    destination: camPos, // current camera position
    orientation: {
      direction, // new direction pointing to Moon
      up // vertical axis (Z vector)
    },
    duration: 2 // 2 seconds for smooth transition
  });
}

</script>

<template>
  <button
      class="fixed bottom-6 right-6 z-[2000] bg-blue-600 text-white px-4 py-2 rounded shadow-lg"
      @click="onClick"
  >
    Center Moon
  </button>
</template>
<style>
.fixed {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 9999;
}
</style>
