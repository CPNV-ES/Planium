<script setup>
import {ref} from "vue";

const lat = ref(0)
const lng = ref(0)

const location = ref({
  lat: undefined,
  lng: undefined
})
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
  emit('submit', { lat, lng })
}
</script>

<template>
      <div class="bg-transparent max-w-sm shrink-0">
        <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
          <label class="label">Latitude</label>
          <input v-model="lat" type="number" class="input" placeholder="42.161836383" />

          <label class="label">Longitude</label>
          <input v-model="lng" type="number" class="input" placeholder="6.13838333" />

          <button type="submit" @click="send(lat, lng)" class="btn btn-neutral mt-4">Find</button>
        </fieldset>
      </div>

</template>