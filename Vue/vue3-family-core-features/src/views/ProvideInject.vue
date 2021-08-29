<template>
  <h3>传入一个响应性的值</h3>
  <input type="text" v-model="val" />
  <Inject></Inject>
</template>
<script>
import { provide, ref } from 'vue'
import Inject from './ProvideInject/Inject.vue'
export default {
  components: {
    Inject
  },
  setup() {
    const val = ref('provide')
    // 传入一个响应性的值
    provide('key', val)
    return {
      val
    }
  }
}
</script>
