<script setup>
import { ref } from "vue";

const smsOptIn = ref(false); // flag: is "Receive..." box checked?
const phone = ref(""); // stores phone number

</script>

<template>
  <!-- receive SMS checkbox -->
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
  <!-- phone number input shown if box checked -->
  <input
      v-if="smsOptIn"
      v-model="phone"
      type="tel"
      placeholder="Phone number : (+123456789)"
      class="input"
  />
</template>