<script setup>
import {VcImageryProviderIon} from "vue-cesium";
const props = defineProps({
  assetId: Number
})
</script>

<template>
  <vc-imagery-provider-ion :assetId="props.assetId">
  </vc-imagery-provider-ion>
</template>
