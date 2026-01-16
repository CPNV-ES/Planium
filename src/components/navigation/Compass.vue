<script setup>

import {VcCompass} from "vue-cesium";
</script>

<template>
  <vc-compass
      :outer-options="{ size: '150px'}"
      :inner-options="{icon: 'fa fa-compass', size: '60px', background: 'transparent', color: '#009688'}"
  ></vc-compass>
</template>
