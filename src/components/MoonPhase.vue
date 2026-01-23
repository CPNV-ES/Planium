<script setup>
import {ref, onMounted, watch, computed} from 'vue';
import {flyTo} from "@/utils/camera.js";

const moonImageUrl = ref(null); // stores the final processed image URL
const isLoading = ref(false); // boolean flag to track the loading state of requests
const hasRequested = ref(false); // boolean flag to indicate if at least one request has been triggered
const error = ref(null); // exception messages container
const location = defineProps({ // user's location ( CoordinateForm -> Viewer -> MoonPhase))
  lng: undefined,
  lat: undefined
})

// true when valid geographic location has been provided
const hasValidLocation = computed(() =>
    typeof location.lat === "number" &&
    typeof location.lng === "number"
);

// ensure fetching the moon phase api only once when location is updated
// prevents duplicate API calls
let hasFetched = false;

// watcher updates moon phase when lat and lng are updated
watch(
    () => [location.lat, location.lng],
    ([lat, lng]) => {
      if (
          typeof lat !== "number" ||
          typeof lng !== "number"
      ) return;

      console.log("[MoonPhase] Auto-fetching moon phase");
      fetchMoonPhase(lat, lng);
    },
    { immediate: true } // runs also when page is reloaded
);

const fetchMoonPhase = async (lat, lng) => {
  /* Fetch Moon's phase from AstronomyAPI
  * documentation: https://docs.astronomyapi.com/endpoints/studio/moon-phase
  * */
  console.log("[MoonPhase] Fetching moon phase…");

  hasRequested.value = true;
  isLoading.value = true;
  error.value = null;

  // credentials for authentication
  const appId = "4894ccad-1e4b-485b-a0b9-82e2a3d74776"; // your app id
  const appSecret = "8be664f3cdaaf766c3538271ac1c7299e8f79742fac62d8ec8c23e9540cb6446c08fdc4aa0711c368e29c1418be162144ff6e8a86d08aa05968164332d633e81e3514f80f99e000dd80cbb04d2b3ed980ed9b18039a1801fb9144d67176c341f691375435b248d06967c0e0d083657ee"; // your app secret

  // check if missing credentials
  if (!appId || !appSecret) {
    error.value = "API Credentials missing";
    isLoading.value = false;
    console.error("[MoonPhase] Missing API credentials");
    return;
  }

  // create base64 string from ID and Secret variables (binary to ASCII)
  // src: https://developer.mozilla.org/en-US/docs/Web/API/Window/btoa
  const hash = btoa(`${appId}:${appSecret}`);

  // get current date (required parameter)
  // new Date().toISOString() returns standard timestamp
  // split('T')[0] returns "YYYY-MM-DD" part
  const today = new Date().toISOString().split('T')[0];

  console.log("[MoonPhase] Request parameters:", {
    lat,
    lng,
    date: today
  });

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
      body: JSON.stringify({ // prepare params as json body
        "format": "png",  // moon phase asset format
        "style": { // custom visual parameters for display container
          "moonStyle": "default", // best quality moon display type (default - shaded - sketch)
          "backgroundStyle": "stars", // star decoration (stars - solid)
          "backgroundColor": "black",
          "headingColor": "white",
          "textColor": "white"
        },
        "observer": {
          "latitude": lat,
          "longitude": lng,
          "date": today // current date
        },
        "view": {
          "type": "portrait-simple", // template for vertical data display (portrait-simple - landscape-simple)
          "orientation": "north-up" // (north-up - south-up)
        }
      })
    });

    console.debug("[MoonPhase] API response status:", response.status);

    // validate server's response
    if (!response.ok) throw new Error("Failed to generate moon image");

    // json parsing
    const result = await response.json();

    console.debug("[MoonPhase] API response payload:", result);

    // update image value (assign new image to reactive reference)
    moonImageUrl.value = result.data.imageUrl;

    if (!moonImageUrl.value) {
      console.warn("[MoonPhase] No image URL returned from API");
    } else {
      console.info("[MoonPhase] Moon image updated successfully");
    }
  } catch (err) {
    // store error message catched
    error.value = err.message;
    console.error("[MoonPhase] Error fetching moon phase:", err);
  } finally {
    // always exit loading state (set loading to false regardless of request result)
    isLoading.value = false;
    console.debug("[MoonPhase] Loading finished");
  }
};

</script>

<template>
  <div
      v-if="isLoading || error || moonImageUrl || hasRequested"
      class="absolute bottom-6 left-6 z-[1000] pointer-events-auto"
  >
    <div class="bg-black/70 backdrop-blur-md border border-white/20 p-2 rounded-xl shadow-2xl transition-all hover:scale-105 duration-300 w-40">

      <div v-if="isLoading" class="flex flex-col items-center justify-center h-48 space-y-2">
        <div class="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        <span class="text-[10px] text-white/50 uppercase tracking-widest">
        Loading Moon
      </span>
      </div>

      <div v-else-if="error" class="text-[10px] text-red-400 p-2 text-center">
        {{ error }}
      </div>

      <div v-else-if="moonImageUrl" class="relative overflow-hidden rounded-lg">
        <img
            :src="moonImageUrl"
            alt="Current Moon Phase"
            class="w-full h-auto block"
        />
      </div>

      <div v-else class="text-[10px] text-white/40 text-center p-2">
        No moon data available
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