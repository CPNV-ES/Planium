<script setup>
import {onMounted, ref} from "vue";

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
  <vc-terrain-provider-arcgis ref="https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer"></vc-terrain-provider-arcgis>
</template>
