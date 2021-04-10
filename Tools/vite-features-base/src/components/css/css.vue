<template>
  <span :class="css.red">module.css</span>
  <span class="red">module.css</span>
  <span class="y">预处理器</span>
</template>

<script setup>
import css from  './example.module.css'
</script>

<style lang="scss" scoped>
  .y {
    color: $injectedColor;
  }
</style>
