<template>
  <div ref="root">获取此元素</div>
</template>
<script>
import { ref, onMounted, nextTick } from 'vue'
export default {
  setup() {
    const root = ref(null)

    onMounted(() => {
      nextTick(() => {
        console.log(root.value)
      })
    })

    return {
      root
    }
  }
}
</script>
