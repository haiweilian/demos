<template>
  <h3>接收到</h3>
  <div>{{ key }}</div>
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
