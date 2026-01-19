<script async setup>
import Tileset from "@/components/primitive/Tileset.vue";
import {getMoonLocation} from "@/utils/tileset.js";

let moonLocation =  getMoonLocation()

</script>

<template>
  <Tileset  :tilesetCartesian="moonLocation" :height="150000" :assetId="2684829"/>
</template>
