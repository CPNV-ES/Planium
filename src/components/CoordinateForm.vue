<script setup>
import {onMounted} from "vue";
import MapPreview from "@/components/mapPreview.vue";

</script>

<template>
  <div class="w-full hero bg-base-200 min-h-screen">
    <div class="hero-content w-full flex-col lg:flex-row-reverse">
      <div class="text-center lg:text-left">
        <h1 class="text-5xl font-bold">Give your coordinate</h1>
        <div id="cesiumContainer" class="py-6 w-full">
          <mapPreview />
        </div>
      </div>
      <div class="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
        <div class="card-body">
          <fieldset class="fieldset">
            <label class="label">Latitude</label>
            <input type="text" class="input" placeholder="0.0.0.0" />
            <label class="label">Longitude</label>
            <input type="text" class="input" placeholder="0.0.0.0" />
            <button class="btn btn-neutral mt-4">Find</button>
          </fieldset>
        </div>
      </div>
    </div>
  </div>
</template>