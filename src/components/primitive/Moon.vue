<script setup >

import {ref} from "vue";
import {VcViewer} from "vue-cesium";

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
      billboard.value = {
        image: 'https://zouyaoji.top/vue-cesium/favicon.png',
        scale: 1
      }

</script>
<template>
<!--  <el-row ref="viewerContainer" class="demo-viewer">-->
      <vc-entity
          ref="entity"
          :position="moonPos"
          :point="point"
          :label="label"
          :ellipsoid="props.moon"
      >
        <!-- :coordinates = "{ west: 130, south: 20, east: 80, north: 25 }" -->
<!--        <vc-graphics-rectangle :coordinates="[130, 20, 80, 25]" material="green"></vc-graphics-rectangle>-->
      </vc-entity>
</template>

