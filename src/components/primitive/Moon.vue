<script setup >

import {ref} from "vue";

const point = ref(null)
const label = ref(null)
const billboard = ref(null)
const cartographic = ref(null)
const now = Cesium.JulianDate.now();
const moonPos = Cesium.Simon1994PlanetaryPositions.computeMoonPositionInEarthInertialFrame(now);

// cartographic.value = Cesium.Cartographic.fromCartesian(moonPos);

       point.value = {
        pixelSize: 28,
        color: 'blue'
      }
      label.value = {
        text: 'Moon ',
        pixelOffset: [0, 80]
      }

</script>
<template>
<!--  <el-row ref="viewerContainer" class="demo-viewer">-->
      <vc-entity
          ref="entity"
          :position="moonPos"
          :point="point"
          :label="label"
      >
        <!-- :coordinates = "{ west: 130, south: 20, east: 80, north: 25 }" -->
      </vc-entity>
</template>

