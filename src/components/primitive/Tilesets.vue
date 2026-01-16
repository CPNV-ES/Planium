<script async setup>

import Google3dTiles from "@/components/primitive/Google3dTiles.vue";
import Tileset from "@/components/primitive/Tileset.vue";
import {getTilesetCartesian} from "@/utils/tileset.js";

let moonLocation = await getTilesetCartesian()

</script>

<template>
<!--  <Google3dTiles :assetId="2275207"/>-->
  <Tileset  :tilesetCartesian="moonLocation" :assetId="2684829"/>
</template>
