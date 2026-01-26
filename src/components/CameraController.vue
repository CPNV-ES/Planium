<template>
  <input
      type="range"
      min="-100"
      max="100"
      v-model.number="value"
      class="fixed right-4 top-20 w-65 h-4 bg-gray-600 rounded-lg"
  />
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  viewer: {
    type: Object,
    required: true
  }
})

const value = ref(0)

let animationFrameId = null

watch(value, (newValue) => {
  // Stop previous animation if exists
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }

  // If slider is between -20 and 20, stop rotation (dead zone)
  if (newValue >= -20 && newValue <= 20) {
    return
  }

  // Start continuous rotation
  const rotate = () => {
    // Get current camera orientation
    const heading = props.viewer.camera.heading

    // Convert slider value to rotation speed
    const speed = newValue / 5000

    // Update heading (rotate the camera on itself)
    props.viewer.camera.setView({
      orientation: {
        heading: heading + speed,
        pitch: props.viewer.camera.pitch,
        roll: props.viewer.camera.roll
      }
    })

    // Continue animation
    animationFrameId = requestAnimationFrame(rotate)
  }

  rotate()
})
</script>
