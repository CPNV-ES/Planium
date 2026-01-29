<script setup>
import { ref } from "vue";
import {sendTestEmail} from "@/utils/mail.js";

const emailCheck = ref(false); // flag: is "Receive..." box checked?
const user_email = ref(""); // stores user's email

</script>
<!-----------------------------------------This is a component to test the email sender manually-------------------------->
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
      v-model="user_email"
      type="email"
      placeholder="Email address : example@email.com"
      class="input"
  />
  <button
      class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
      type="submit"
      @click="async () => sendTestEmail(emailCheck, user_email)"
  >
    Send Test Email
  </button>
</template>