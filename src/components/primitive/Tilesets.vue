<script async setup>
import Tileset from "@/components/primitive/Tileset.vue";
import {getTilesetCartesian} from "@/utils/tileset.js";

let moonLocation = await getTilesetCartesian()

</script>

<template>
  <Tileset  :tilesetCartesian="moonLocation" :assetId="2684829"/>
</template>
