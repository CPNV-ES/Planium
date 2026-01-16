<script setup>
import {VcPrimitiveTileset} from "vue-cesium";
import {Cartesian3} from "cesium";

const cesiumToken = import.meta.env.VITE_CESIUM_ACCESS_TOKEN;
 const props = defineProps({
    assetId: Number,
    currentLocation: Cartesian3,
    tilesetCartesian: {
      x: Number,
      y: Number,
      z: Number
    }
      })

const onReady = ({ cesiumObject: tileset }) => {
  const cartographic = Cesium.Cartographic.fromCartesian(props.tilesetCartesian) // put real moon place if possible
  const surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height)
  const offset = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 1000)
  const translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3())
  const translationMatrix = Cesium.Matrix4.fromTranslation(translation)

  const scaleFactor = 0.1
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
      :assetId="assetId"
      :accessToken="cesiumToken"
      @ready="onReady"
  ></vc-primitive-tileset>
</template>

<style scoped>

</style>