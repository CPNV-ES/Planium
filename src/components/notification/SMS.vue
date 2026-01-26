<script setup>
import { ref } from "vue";

const smsOptIn = ref(false);
const phone = ref("");

</script>

<template>
  <label class="flex items-center gap-2">
    <input
        type="checkbox"
        v-model="smsOptIn"
    />
    <div>
      <p>Receive SMS notification when</p>
      <p>a plane is about to fly near the Moon</p>
    </div>
  </label>
  <input
      v-if="smsOptIn"
      v-model="phone"
      type="tel"
      placeholder="Phone number : (+123456789)"
      class="input"
  />
</template>