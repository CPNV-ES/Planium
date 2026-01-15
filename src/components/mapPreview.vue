<script setup>
import {VcViewer, VcCompass, VcNavigation, VcTerrainProviderCesium, VcLayerImagery, VcImageryProviderOsm} from "vue-cesium";
import {onMounted, ref, watch} from "vue";
const viewerRef = ref(null)
const isViewerReady = ref(false)
const viewer = ref()
const location = defineProps({
  lng: undefined,
  lat:  undefined
})


onMounted(() => {
  viewerRef.value.creatingPromise.then((readyObj) => {
    isViewerReady.value = true
  })

})

const onViewerReady = (readyObj) => {
  flyTo(readyObj, location.lat, location.lng)
  viewer.value = readyObj
}

watch(
    [() => location.lat, () => location.lng],
    ([newLat, newLng]) => {
      if (viewer.value && newLat && newLng) {
        flyTo(viewer.value, newLat, newLng)
      }
    }
)


function flyTo(readyObj, lat, lng){
try {

  readyObj.viewer.camera.flyTo({
    destination: readyObj.Cesium.Cartesian3.fromDegrees(
        lng ?? 6.500465335539498, // longitude
        lat ?? 46.82166054184684, //latitude
        100, //height
    ),
    orientation: {
      heading: Cesium.Math.toRadians(0.0),
      pitch: Cesium.Math.toRadians(10.0),
      roll: 0.0
    }
  })
}
catch(e) {
  console.log(e)
}

}

</script>

<template>
  <vc-viewer access-token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4MzYzYjQ5Yi1hYzkzLTRhODctYWNkNi04ZWRmM2VhNmU2MzEiLCJpZCI6Mzc3NTg1LCJpYXQiOjE3NjgyMDg0NjN9.-_Sbjc8qnYU-KGxD2wBzXxvDPcGkasVe2vZCEY9KtmI"
             ref="viewerRef"
             @ready="onViewerReady">
      <vc-layer-imagery>
        <vc-imagery-provider-osm>
        </vc-imagery-provider-osm>
      </vc-layer-imagery>
      <vc-imagery-provider-amap />
    <template v-if="isViewerReady">
      <vc-compass></vc-compass>
      <vc-navigation></vc-navigation>
      <vc-terrain-provider-cesium></vc-terrain-provider-cesium>
    </template>
  </vc-viewer>

</template>

