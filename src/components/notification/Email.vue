<script setup>
import { ref } from "vue";

const emailCheck = ref(false); // flag: is "Receive..." box checked?
const user_email = ref(""); // stores user's email

async function sendTestEmail() {
  if (!emailCheck.value) {
    alert("Please check the box to receive email notifications.");
    return;
  }
  if (!user_email.value) {
    alert("Please enter a valid email address.");
    return;
  }

  try{
    const res = await fetch("http://localhost:8080/api/send-test-email", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ user_email: user_email.value }),
    });

    if (!res.ok) throw new Error("Failed to send test email");

    alert("Test email sent successfully.");
  } catch (error) {
    alert("Error sending email:" + error.message);
  }
}
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
      v-model="user_email"
      type="email"
      placeholder="Email address : example@email.com"
      class="input"
  />
  <button
      class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
      type="submit"
      @click="sendTestEmail"
  >
    Send Test Email
  </button>
</template>