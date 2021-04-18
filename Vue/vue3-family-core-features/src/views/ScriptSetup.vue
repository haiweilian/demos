<script setup>
import { onMounted, ref } from 'vue'
// 自动注册
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

<template>
  <h2>此功能是实验性功能 https://github.com/vuejs/rfcs/pull/227</h2>
  <span>parent count {{ count }}</span>
  <button @click="inc">parent inc</button>
  <Context ref="context" :count="count" :attr-count="count" @dec="dec"></Context>
</template>
