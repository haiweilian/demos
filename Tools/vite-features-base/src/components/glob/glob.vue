<template>
  <h1>懒加载</h1>
  <div>{{Object.keys(glob1)}}</div>
  <h1>直接引入所有的模块</h1>
  <div>{{Object.keys(glob2)}}</div>
</template>

<script setup>
  const glob1 = import.meta.glob('./dir/*')
  console.log(glob1)
  const glob2 = import.meta.globEager('./dir/*')
  console.log(glob2)
</script>
