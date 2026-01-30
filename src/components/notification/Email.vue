<script setup>
import {onMounted, ref, watch} from "vue";
import {getEmail, saveEmail, sendEmail} from "@/utils/mail.js";
const displayed = ref(true)
const emailCheck = ref(false); // flag: is "Receive..." box checked?
const user_email = ref(""); // stores user's email

onMounted(() => {
  const storedEmail = getEmail()

  if (storedEmail && storedEmail.trim() !== "") {
    user_email.value = storedEmail;
    displayed.value = false
  }
});

watch(displayed, (newValue) => {
    if (newValue){
      user_email.value = getEmail()
    }
})
</script>
<!-----------------------------------------This is a component to test the email sender manually-------------------------->
<template>
  <div v-if="displayed" class="bg-white/20 backdrop-blur-md rounded-xl shadow-lg p-4 border border-white/10 flex flex-col gap-3">
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
    <div class="flex justify-between gap-2">
  <button
      class="btn btn-primary"
      type="submit"
      @click="() => {
        saveEmail(user_email, `salut c'est le test`)
        displayed = false
  }"
  >
    Save email
  </button>

      <button
          class=" btn btn-error px-4 py-2  transition disabled:opacity-50"
          type="submit"
          @click="() => {
            displayed = false
          }"
      >
        Close
      </button>
    </div>
  </div>
  <div v-else class="w-10 justify-center bg-white/20 backdrop-blur-md rounded-xl shadow-lg border p-1 border-white/10 flex flex-col gap-3">
    <button @click="() => {displayed = true}" class="w-full flex justify-center items-center">
    <svg class="w-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M61.4 64C27.5 64 0 91.5 0 125.4 0 126.3 0 127.1 .1 128L0 128 0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-256-.1 0c0-.9 .1-1.7 .1-2.6 0-33.9-27.5-61.4-61.4-61.4L61.4 64zM464 192.3L464 384c0 8.8-7.2 16-16 16L64 400c-8.8 0-16-7.2-16-16l0-191.7 154.8 117.4c31.4 23.9 74.9 23.9 106.4 0L464 192.3zM48 125.4C48 118 54 112 61.4 112l389.2 0c7.4 0 13.4 6 13.4 13.4 0 4.2-2 8.2-5.3 10.7L280.2 271.5c-14.3 10.8-34.1 10.8-48.4 0L53.3 136.1c-3.3-2.5-5.3-6.5-5.3-10.7z"/>
    </svg>
    </button>
  </div>
</template>