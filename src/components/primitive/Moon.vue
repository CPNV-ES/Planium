<script setup>
import { ref, onBeforeUnmount, computed } from "vue";

const moon2Position = ref(null);
const point2 = ref(null);
const label2 = ref(null);
const viewerId = ref("Unknown");

const debugStatus = ref("Waiting for viewer...");
let removeTickListener = null;

// ---- SAFE EARTH ANCHOR (VALID CARTOGRAPHIC) ----
let earthAnchor = null;

// ---- POLYLINE POSITIONS (NEVER INVALID) ----
const polylinePositions = computed(() => {
  if (!earthAnchor || !moon2Position.value || typeof moon2Position.value.x !== "number") {
    return undefined;
  }
  return [earthAnchor, moon2Position.value];
});

const onViewerReady = ({ Cesium, viewer }) => {
  if (removeTickListener) return;

  viewerId.value = viewer.container.id || "Main Window";
  debugStatus.value = "Viewer Ready - Initializing Moon Engine...";

  viewer.scene.farToNearRatio = 1_000_000;
  viewer.scene.logarithmicDepthBuffer = true;

  if (viewer.scene.mode !== Cesium.SceneMode.SCENE3D) {
    debugStatus.value = "Moon hidden (Not in 3D Mode)";
    return;
  }

  // ---- CREATE EARTH ANCHOR ONCE ----
  earthAnchor = Cesium.Ellipsoid.WGS84.scaleToGeodeticSurface(
      Cesium.Cartesian3.fromDegrees(0, 0)
  );

  // ---- STYLES ----
  point2.value = {
    pixelSize: 40,
    color: Cesium.Color.fromCssColorString("#b026ff"),
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 2,
    disableDepthTestDistance: Number.POSITIVE_INFINITY
  };

  label2.value = {
    text: "INTEGRATED MOON",
    font: "14pt monospace",
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    fillColor: Cesium.Color.YELLOW,
    outlineWidth: 2,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    pixelOffset: new Cesium.Cartesian2(0, -50)
  };

  // ---- SCRATCH OBJECTS ----
  const scratchMatrix = new Cesium.Matrix3();
  const scratchFixedMatrix = new Cesium.Matrix3();
  const scratchCartesian = new Cesium.Cartesian3();

  let frame = 0;

  const listener = (clock) => {
    frame++;
    if (frame % 5 !== 0) return;

    let pos = viewer.scene.moon.position;

    if (!Cesium.defined(pos)) {
      pos = Cesium.Simon1994PlanetaryPositions.computeMoonPositionInEarthInertialFrame(
          clock.currentTime
      );
    }

    if (!Cesium.defined(pos)) return;

    const icrfToFixed = Cesium.Transforms.computeFixedToIcrfMatrix(
        clock.currentTime,
        scratchMatrix
    );

    if (!Cesium.defined(icrfToFixed)) {
      debugStatus.value = "Waiting for transform data...";
      return;
    }

    const fixedToIcrf = Cesium.Matrix3.transpose(icrfToFixed, scratchFixedMatrix);
    Cesium.Matrix3.multiplyByVector(fixedToIcrf, pos, scratchCartesian);

    const distanceMoved = moon2Position.value
        ? Cesium.Cartesian3.distance(moon2Position.value, scratchCartesian)
        : Infinity;

    if (distanceMoved > 1) {
      moon2Position.value = Cesium.Cartesian3.clone(
          scratchCartesian,
          moon2Position.value || new Cesium.Cartesian3()
      );
      debugStatus.value = "Moon Position Synchronized";
    }
  };

  viewer.clock.onTick.addEventListener(listener);
  removeTickListener = () => viewer.clock.onTick.removeEventListener(listener);

  /*
  // ---- CAMERA FLIGHT ----
  setTimeout(() => {
    if (!moon2Position.value) return;

    debugStatus.value = "Traveling to Moon...";

    const offset = Cesium.Cartesian3.multiplyByScalar(
        Cesium.Cartesian3.normalize(moon2Position.value, new Cesium.Cartesian3()),
        20_000_000,
        new Cesium.Cartesian3()
    );

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.subtract(
          moon2Position.value,
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
  if (removeTickListener) removeTickListener();
});

defineExpose({ onViewerReady });
</script>

<template>
  <div class="absolute top-24 left-6 bg-black/80 text-white p-4 font-mono text-xs z-[2000] border border-violet-500">
    <div class="text-gray-400 mb-1 border-b border-gray-700 pb-1">
      WINDOW: {{ viewerId }}
    </div>
    <div :class="moon2Position ? 'text-lime-400' : 'text-red-400'" class="mt-2">
      ● {{ debugStatus }}
    </div>
    <div v-if="moon2Position" class="text-gray-400 mt-1">
      COORDS DETECTED
    </div>
  </div>

  <template v-if="moon2Position">
    <vc-entity :position="moon2Position" :point="point2" :label="label2" />

    <vc-entity v-if="polylinePositions">
      <vc-graphics-polyline
          :positions="polylinePositions"
          :width="2"
          :material="[255, 255, 0, 100]"
      />
    </vc-entity>
  </template>
</template>
