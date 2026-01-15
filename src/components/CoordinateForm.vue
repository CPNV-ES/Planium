<script setup>
import MapPreview from "@/components/mapPreview.vue";
import {ref} from "vue";
// Check later to use the given inputs for location
const lat = ref(0.0)
const lng = ref(0.0)

</script>

<template>
  <div class="flex flex-row w-[70%] justify-center items-center p-6">
      <div class="bg-base-100 w-full max-w-sm shrink-0">
        <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
          <legend class="fieldset-legend">Your position</legend>

          <label class="label">Latitude</label>
          <input :value="lat" type="text" class="input" placeholder="42.161836383" />

          <label class="label">Longitude</label>
          <input :value="lng" type="text" class="input" placeholder="6.13838333" />

          <button class="btn btn-neutral mt-4">Find</button>
        </fieldset>
      </div>
    <div id="cesiumContainer" class="flex w-full">
       <mapPreview :lng :lat />
    </div>
  </div>
</template>