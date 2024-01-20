<script setup>
defineProps(["color"]);
const c = ["black", "white", "index"];
</script>

<template>
  <div>
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <circle v-if="[0, 1].includes(color / 1)" r="16" cx="16" cy="16" :fill="c[color ^ 1]" />
      <circle v-if="color == 3" r="4" cx="16" cy="16" :fill="`red`" />
    </svg>
  </div>
</template>

<style scoped>
  div {
    line-height: 0;
  }
  svg {
    width: 100%;
    height: 100%;
    cursor: pointer;
  }
</style>