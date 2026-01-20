<script setup>
import {VcViewer} from "vue-cesium";
import {ref, watch} from "vue";
import {loadPlanes, movePlanes, prepareScene, removeMoving} from "@/utils/scene.js";
import Imagery from "@/components/imagery/Imagery.vue";
import {flyTo} from "@/utils/camera.js";
import Navigation from "@/components/navigation/Navigation.vue";
import Terrain from "@/components/terrain/Terrain.vue";
import Moon from "@/components/primitive/Moon.vue";

const viewerRef = ref(null)
const isViewerReady = ref(false)
const cesiumToken = import.meta.env.VITE_CESIUM_ACCESS_TOKEN;
const Vcviewer = ref(null)
const cesium = ref(null)
const location = defineProps({
  lng: undefined,
  lat: undefined
})


watch(
    [() => location.lat, () => location.lng],
    ([newLat, newLng]) => {
      if (Vcviewer.value && newLat !== 0 && newLng !== 0) {
        flyTo(Vcviewer.value.camera, cesium.value, newLat, newLng)
      } else {
        console.error(
            "Unable to update camera position: viewer is not ready or location is invalid.",
            {
              viewerReady: !!Vcviewer.value,
              lat: newLat,
              lng: newLng
            }
        );
      }
    }
)


const onViewerReady = async ({Cesium, viewer}) => {
  if (viewerRef.value) {

    try {
      if (Cesium) {
        await prepareScene(viewer.scene)
        // removeMoving(viewer.scene)
      }

      flyTo(viewer.camera, Cesium, location.lat, location.lng)
      isViewerReady.value = true
      Vcviewer.value = viewer
      cesium.value = Cesium
      await loadPlanes(viewer)
      setInterval(async () => {
       await movePlanes(viewer)
      }, 10000)
    } catch (error) {
      console.error("Error loading tileset:", error);
    }
  }
};



</script>

<template>
  <vc-viewer
      :showCredit="false"
      :enableMouseEvent="false"
      :scene3DOnly="true"
      ref="viewerRef"
      :access-token="cesiumToken"
      @ready="onViewerReady">

    <template v-if="isViewerReady">
          <Imagery/>
          <Terrain/>
          <Navigation/>
      <Moon/>
    </template>
  </vc-viewer>

</template>

