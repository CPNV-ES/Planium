<script setup>
import {VcPrimitiveTileset} from "vue-cesium";
defineProps({
  assetId: Number
})
debugger
</script>

<template>
  <vc-primitive-tileset
      ref="primitive"
      :assetId="assetId"
  >
  </vc-primitive-tileset>
</template>
