<script setup>
import MapPreview from "@/components/mapPreview.vue";
import {ref} from "vue";
// Check later to use the given inputs for location
const lat = ref(0.0)
const lng = ref(0.0)
</script>

<template>
      <div class="px-6 text-center lg:text-left">
        <h1 class="text-center py-2 text-5xl font-bold">Planium</h1>
      </div>
      <div class="bg-base-100 w-full max-w-sm shrink-0 px-6">
        <div class="">
          <fieldset class="fieldset">
            <label class="label">Latitude</label>
            <input @input="lat" type="text" class="input" placeholder="0.0.0.0" />
            <label class="label">Longitude</label>
            <input @input="lng" type="text" class="input" placeholder="0.0.0.0" />
            <button class="btn btn-neutral mt-4">Find</button>
          </fieldset>
        </div>
      </div>
  <div id="cesiumContainer" class="px-6 w-full">
    <mapPreview :lng :lat />
  </div>
</template>