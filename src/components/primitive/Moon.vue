<script setup>
import { ref, onBeforeUnmount, computed } from "vue";

/*
This component defines Moon's parameters and places it to real location in real time.
 */

// reactive references for Moon's visual appearance and position
const moonPos = ref(null); // 3D position (x, y, z)
const point = ref(null);  // point space marker (Moon display)
const label = ref(null);  // display text above Moon

// const debugStatus = ref("Waiting for viewer..."); // DEBUG
let removeTickListener = null; // for detaching Cesium clock listener when component is destroyed

const onViewerReady = ({ Cesium, viewer }) => {
  if (removeTickListener) return; // prevent attaching duplicate clock listeners

  // debugStatus.value = "Viewer Ready - Tracking Moon..."; // DEBUG

  viewer.scene.farToNearRatio = 1_000_000; // improve depth ratio for large scale scene (Earth to Moon)
  viewer.scene.logarithmicDepthBuffer = true; // switches depth layer distribution to log for better large scale precision

  // style config
  // point marker (Moon)
  point.value = {
    pixelSize: 40,
    color: Cesium.Color.fromCssColorString("#B2B2B2"), // Moon gray
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 2,
    disableDepthTestDistance: Number.POSITIVE_INFINITY // set limit to infinity to ensure Moon is always displayed in front
  };

  // "Moon" label for easy spotting
  label.value = {
    text: "MOON",
    font: "14pt monospace",
    fillColor: Cesium.Color.WHITE,
    outlineWidth: 2,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    pixelOffset: new Cesium.Cartesian2(0, -50)
  };

  // temporally allocated storage for dynamic variables (avoid creating new objects every time)
  const scratchMatrix = new Cesium.Matrix3();
  const scratchFixedMatrix = new Cesium.Matrix3();
  const scratchCartesian = new Cesium.Cartesian3();

  // frame counter
  let frame = 0;

  // runs on every Cesium clock tick, computes Moon's position relative to Earth
  const listener = (clock) => {
    frame++;
    if (frame % 5 !== 0) return; // update every 5 frames (avoid over-rendering)

    // try to get current Moon position from scene
    let pos = viewer.scene.moon.position;

    // use math to calculate if pos isn't readable from scene
    if (!Cesium.defined(pos)) {
      pos = Cesium.Simon1994PlanetaryPositions.computeMoonPositionInEarthInertialFrame(clock.currentTime);
    }

    // stop if Moon's position is still unreadable
    if (!Cesium.defined(pos)) return;

    // compute transformation matrix from ECEF (Earth-Fixed) to ICRF (inertial) coordinates at current time
    const icrfToFixed = Cesium.Transforms.computeFixedToIcrfMatrix(
        clock.currentTime,
        scratchMatrix
    );

    // stop if matrix is undefined
    if (!Cesium.defined(icrfToFixed)) return;

    // transpose matrix to convert from ICRF (inertial) to ECEF (Earth-Fixed)
    const fixedToIcrf = Cesium.Matrix3.transpose(
        icrfToFixed,
        scratchFixedMatrix
    );

    // apply transformation to Moon's inertial position, result is cartesian coordinate
    Cesium.Matrix3.multiplyByVector(
        fixedToIcrf,
        pos,
        scratchCartesian
    );

    // reactive relocation and rerender if position delta > 10 meters
    if (
        !moonPos.value ||
        // square function for strict positive value
        Cesium.Cartesian3.distanceSquared(moonPos.value, scratchCartesian) > 100
    ) {
      moonPos.value = Cesium.Cartesian3.clone(
          scratchCartesian,
          moonPos.value || new Cesium.Cartesian3()
      );
      // debugStatus.value = "Moon Synced"; // DEBUG
    }
  };

  // add clock listener for regular Moon position update
  viewer.clock.onTick.addEventListener(listener);
  // save function that removes clock listener when component is destroyed
  removeTickListener = () => viewer.clock.onTick.removeEventListener(listener);

  /* Uncomment to redirect camera to moon's location
  // ---- CAMERA FLIGHT TO MOON ----
  setTimeout(() => {
    if (!moonPos.value) return;

    debugStatus.value = "Traveling to Moon...";

    const offset = Cesium.Cartesian3.multiplyByScalar(
        Cesium.Cartesian3.normalize(moonPos.value, new Cesium.Cartesian3()),
        20_000_000,
        new Cesium.Cartesian3()
    );

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.subtract(
          moonPos.value,
          offset,
          new Cesium.Cartesian3()
      ),
      orientation: {
        direction: Cesium.Cartesian3.normalize(offset, new Cesium.Cartesian3()),
        up: Cesium.Cartesian3.UNIT_Z
      },
      duration: 5
    });
  }, 4000);
  */
};

onBeforeUnmount(() => {
  // ensure clock listener is removed when component is destroyed
  if (removeTickListener) removeTickListener();
});
// expose function to make it accessible outside component with
// "moonComponentRef.value.onViewerReady({ Cesium, viewer})"
defineExpose({ onViewerReady });
</script>

<template>
  <!-- render Moon only if there's a valid position -->
  <vc-entity
      v-if="moonPos"
      :position="moonPos"
      :point="point"
      :label="label"
  />
</template>
