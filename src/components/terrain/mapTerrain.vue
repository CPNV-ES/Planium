<script setup>
import {onMounted, ref} from "vue";
import {VcTerrainProviderCesium} from "vue-cesium";

const imageryProvider = ref(null)
const props = defineProps({
  cesium : {}
})

onMounted(async ()=> {
  imageryProvider.value = await Cesium.ArcGisMapServerImageryProvider.fromUrl(
      "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer"
  )
})

</script>

<template>
  <vc-terrain-provider-cesium ref="provider"></vc-terrain-provider-cesium>
</template>
