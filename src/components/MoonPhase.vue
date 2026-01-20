<script setup>
import { ref, onMounted } from 'vue';

const moonImageUrl = ref(null); // stores the final processed image URL
const isLoading = ref(true); // boolean flag to track the loading state of requests
const error = ref(null); // exception messages container

const fetchMoonPhase = async () => {
  /* Fetch Moon's phase from AstronomyAPI
  * documentation: https://docs.astronomyapi.com/endpoints/studio/moon-phase
  * */
  // credentials for authentication
  const appId = "VITE_MOON_PHASE_APP_ID";
  const appSecret = "VITE_MOON_PHASE_APP_SECRET";

  // stop function if missing credentials
  if (!appId || !appSecret) {
    error.value = "API Credentials missing";
    isLoading.value = false;
    return;
  }

  // create base64 string from ID and Secret variables (binary to ASCII)
  // src: https://developer.mozilla.org/en-US/docs/Web/API/Window/btoa
  const hash = btoa(`${appId}:${appSecret}`);

  // get current date (required parameter)
  // new Date().toISOString() returns standard timestamp
  // split('T')[0] returns "YYYY-MM-DD" part
  const today = new Date().toISOString().split('T')[0];

  try {
    // POST request to AstronomyAPI
    // src: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
    const response = await fetch("https://api.astronomyapi.com/api/v2/studio/moon-phase", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${hash}`,
        "Content-Type": "application/json"
      },

      // src: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
      body: JSON.stringify({
        "format": "png",  // moon phase asset format
        "style": { // custom visual parameters for display container
          "moonStyle": "default", // best quality moon display type (default - shaded - sketch)
          "backgroundStyle": "stars", // star decoration (stars - solid)
          "backgroundColor": "black",
          "headingColor": "white",
          "textColor": "white"
        },
        "observer": {
          "latitude": 6.56774,
          "longitude": 79.88956,
          "date": today // current date
        },
        "view": {
          "type": "portrait-simple", // template for vertical data display (portrait-simple - landscape-simple)
          "orientation": "north-up" // (north-up - south-up)
        }
      })
    });

    // validate server's response
    if (!response.ok) throw new Error("Failed to generate moon image");

    // json parsing
    const result = await response.json();
    // update image value (assign new image to reactive reference)
    moonImageUrl.value = result.data.imageUrl;
  } catch (err) {
    // store error message catched
    error.value = err.message;
  } finally {
    // always exit loading state (set loading to false regardless of request result)
    isLoading.value = false;
  }
};

// fetchMoonPhase executes automatically after component is successfully mounted
onMounted(fetchMoonPhase);
</script>

<template>
  <div class="absolute bottom-6 left-6 z-[1000] pointer-events-auto">
    <div class="bg-black/70 backdrop-blur-md border border-white/20 p-2 rounded-xl shadow-2xl transition-all hover:scale-105 duration-300 w-40">

      <div v-if="isLoading" class="flex flex-col items-center justify-center h-48 space-y-2">
        <div class="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        <span class="text-[10px] text-white/50 uppercase tracking-widest">Loading Moon</span>
      </div>

      <div v-else-if="error" class="text-[10px] text-red-400 p-2 text-center">
        {{ error }}
      </div>

      <div v-else class="relative overflow-hidden rounded-lg">
        <img
            :src="moonImageUrl"
            alt="Current Moon Phase"
            class="w-full h-auto block"
        />
      </div>

    </div>
  </div>
</template>

<style scoped>
/* ensure the component doesn't interfere with map clicks unless hovered */
.z-1000 {
  z-index: 1000;
}
</style>