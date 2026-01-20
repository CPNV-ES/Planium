<script setup>
import {VcPrimitiveTileset} from "vue-cesium";

const cesiumToken = import.meta.env.VITE_CESIUM_ACCESS_TOKEN;

const onReady = ({ cesiumObject: tileset }) => {
  const now = Cesium.JulianDate.now();
  const moonPosInertial = Cesium.Simon1994PlanetaryPositions.computeMoonPositionInEarthInertialFrame(now);
  const icrfToFixed = Cesium.Transforms.computeIcrfToFixedMatrix(now);
  const moonPositionReal = new Cesium.Cartesian3();
  if (Cesium.defined(icrfToFixed)) {
    Cesium.Matrix3.multiplyByVector(icrfToFixed, moonPosInertial, moonPositionReal);
  }

  const cartographic = Cesium.Cartographic.fromCartesian(moonPositionReal);
  const finalPosition = Cesium.Cartesian3.fromRadians(
      cartographic.longitude,
      cartographic.latitude,
      150000
  );
  const translationMatrix = Cesium.Matrix4.fromTranslation(finalPosition)

  const scaleFactor = 0.01
  const scaleMatrix = Cesium.Matrix4.fromUniformScale(scaleFactor)
  tileset.modelMatrix = Cesium.Matrix4.multiply(
      translationMatrix,
      scaleMatrix,
      new Cesium.Matrix4()
  )

}
</script>

<template>
  <vc-primitive-tileset
      ref="primitive"
      :assetId="2684829"
      :accessToken="cesiumToken"
      @ready="onReady"
  ></vc-primitive-tileset>
</template>

<style scoped>

</style>