<template>
  <p><button @click="inc">parent inc</button></p>
  <p>
    <span>parent count {{ count }}</span>
  </p>
  <Context ref="context" :count="count" @dec="dec"> </Context>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import Context from './ScriptSetup/Context.vue'

// 全局变量自动给模板
const count = ref(0)

const inc = () => {
  count.value++
}

const dec = () => {
  count.value--
}

// 获取子组件内容
const context = ref(null)
onMounted(() => {
  // 只能拿到 子组件通过 expose 暴露出来的数据和方法
  console.log('context', context)
})
</script>
