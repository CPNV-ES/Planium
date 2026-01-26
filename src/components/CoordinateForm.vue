<script setup>
import Viewer from "@/components/Viewer.vue";
import SMS from "@/components/notification/SMS.vue"
import {ref} from "vue";
// Check later to use the given inputs for location
const lat = ref(0)
const lng = ref(0)

const location = ref({
  lat: undefined,
  lng: undefined
})

function send(){
  location.value = {lat: parseFloat(lat.value), lng: parseFloat(lng.value)}
}
</script>

<template>
  <div class="flex flex-row w-full justify-center items-center p-6">
      <div class="bg-base-100 w-full max-w-sm shrink-0">
        <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
          <legend class="fieldset-legend">Your position</legend>

          <label class="label">Latitude</label>
          <input v-model="lat" type="number" class="input" placeholder="42.161836383" />

          <label class="label">Longitude</label>
          <input v-model="lng" type="number" class="input" placeholder="6.13838333" />

          <button type="submit" @click="send()" class="btn btn-neutral mt-4">Find</button>
        </fieldset>
        <SMS />
      </div>
    <div id="cesiumContainer" class="flex w-[70%]">
       <Viewer v-bind="location" />
    </div>
  </div>
</template>