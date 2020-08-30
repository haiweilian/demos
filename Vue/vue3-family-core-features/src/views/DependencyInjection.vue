<template>
  <div>
    <div><input type="text" v-model="val" />provideParent</div>
    <injectChild></injectChild>
  </div>
</template>
<script>
import { provide, inject, ref, watchEffect } from 'vue'
export default {
  components: {
    injectChild: {
      setup() {
        const val = inject('key')
        console.log('injectChild', val)
        watchEffect(() => {
          console.log('injectChild', val.value)
        })
      },
      render() {
        return <div></div>
      }
    }
  },
  setup() {
    const val = ref('provide')
    provide('key', val)
    return {
      val
    }
  }
}
</script>
