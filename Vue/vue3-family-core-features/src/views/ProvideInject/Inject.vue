<template>
  <div>inject 接收到 {{ key }}</div>
</template>
<script>
import { inject } from 'vue'
export default {
  setup() {
    const key = inject('key')

    return {
      key
    }
  }
}
</script>
