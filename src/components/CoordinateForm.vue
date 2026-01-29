<script setup>
import {ref} from "vue";
import Email from "@/components/notification/Email.vue"

const lat = ref(0)
const lng = ref(0)

const emit = defineEmits({
  click: null,

  // Validate submit event
  submit: ({ lat, lng }) => {
    if (typeof lat === 'number' && typeof lng === 'number') {
      return true
    } else {
      console.warn('Invalid submit event payload!')
      return false
    }
  }
})

function send(lat, lng){
  emit('submit', { lat, lng: lng })
}
</script>

<template>
  <div class="absolute top-18 left-[1%] z-10000 flex flex-col gap-2 w-80 bg-transparent ">
    <div class=" flex flex-row w-xl justify-between items-center bg-white/20 backdrop-blur-sm rounded-box shadow-lg px-2">
      <fieldset class="flex flex-col gap-1">
      <label class="label">Latitude</label>
      <input v-model="lat" type="number" class="input input-xs" placeholder="42.161836383" />
        </fieldset>

      <fieldset class="flex flex-col gap-1">
      <label class="label">Longitude</label>
      <input v-model="lng" type="number" class="input input-xs" placeholder="6.13838333" />
      </fieldset>
      <button type="submit" @click="send(lat, lng)" class="btn btn-neutral mt-8">Find</button>
    </div>
    <div class="bg-white/20 backdrop-blur-md rounded-xl shadow-lg p-4 border border-white/10 flex flex-col gap-3">      <Email />
    </div>
  </div>

</template>