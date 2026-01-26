<script setup>

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
</template>