<script setup>
import { ref } from "vue";

const emailCheck = ref(false); // flag: is "Receive..." box checked?
const phone = ref(""); // stores phone number

</script>

<template>
  <!-- receive email checkbox -->
  <label class="flex items-center gap-2">
    <input
        type="checkbox"
        v-model="emailCheck"
    />
    <div>
      <p>Receive an email notification when</p>
      <p>a plane is about to fly near the Moon</p>
    </div>
  </label>
  <!-- email address input shown if box checked -->
  <input
      v-if="emailCheck"
      v-model="phone"
      type="email"
      placeholder="Email address : example@email.com"
      class="input"
  />
</template>