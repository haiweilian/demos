<template>
  <div>
    <div><input type="text" v-model="val" />传入一个响应性的值</div>
    <Inject></Inject>
  </div>
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
