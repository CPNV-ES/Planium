<script setup>
import {onMounted} from "vue";

window.CESIUM_BASE_URL = '/static/Cesium/';

import { Cartesian3, createOsmBuildingsAsync, Ion, Math as CesiumMath, Terrain, Viewer } from 'cesium';
import "cesium/Build/Cesium/Widgets/widgets.css";


Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4MzYzYjQ5Yi1hYzkzLTRhODctYWNkNi04ZWRmM2VhNmU2MzEiLCJpZCI6Mzc3NTg1LCJpYXQiOjE3NjgyMDg0NjN9.-_Sbjc8qnYU-KGxD2wBzXxvDPcGkasVe2vZCEY9KtmI';

onMounted(async () => {
  const viewer = new Viewer('cesiumContainer', {
    terrain: Terrain.fromWorldTerrain(),
  });

  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(-122.4175, 37.655, 400),
    orientation: {
      heading: CesiumMath.toRadians(0.0),
      pitch: CesiumMath.toRadians(-15.0),
    }
  });

  const buildingTileset = await createOsmBuildingsAsync();
  viewer.scene.primitives.add(buildingTileset);
})

</script>

<template>
  <div class="w-full hero bg-base-200 min-h-screen">
    <div class="hero-content w-full flex-col lg:flex-row-reverse">
      <div class="text-center lg:text-left">
        <h1 class="text-5xl font-bold">Give your coordinate</h1>
        <div id="cesiumContainer" class="py-6 w-full">

        </div>
      </div>
      <div class="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
        <div class="card-body">
          <fieldset class="fieldset">
            <label class="label">Email</label>
            <input type="email" class="input" placeholder="Email" />
            <label class="label">Password</label>
            <input type="password" class="input" placeholder="Password" />
            <div><a class="link link-hover">Forgot password?</a></div>
            <button class="btn btn-neutral mt-4">Login</button>
          </fieldset>
        </div>
      </div>
    </div>
  </div>
</template>