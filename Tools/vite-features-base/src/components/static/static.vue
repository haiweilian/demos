<template>
  <img :src="logo1" alt="">
  {{logo2}}
</template>

<script setup>
import logo1 from './logo.png'
import logo2 from './logo.txt?raw'
</script>

<style lang="scss" scoped>
  img {
    width: 50px;
    height: 50px;
    margin-right: 10px;
  }
</style>
