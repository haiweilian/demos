<template>
  <div>
    <label>
      <input type="checkbox" v-model="checked" />
      <span>点击触发更新</span>
    </label>
  </div>
</template>
<script>
import {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  onRenderTracked,
  onRenderTriggered,
  ref
} from 'vue'
export default {
  setup() {
    onBeforeMount(() => {
      console.log('onBeforeMount')
    })
    onMounted(() => {
      console.log('onMounted')
    })

    onBeforeUpdate(() => {
      console.log('onBeforeUpdate')
    })
    onUpdated(() => {
      console.log('onUpdated')
    })

    onBeforeUnmount(() => {
      console.log('onBeforeUnmount')
    })
    onUnmounted(() => {
      console.log('onUnmounted')
    })

    // 在 onBeforeUpdate 之前触发，触发更新值时调用
    onRenderTriggered(e => {
      console.log('onRenderTriggered', e)
    })
    // 在 onBeforeUpdate 之后 onUpdated 之前触发，追踪依赖时调用
    onRenderTracked(e => {
      console.log('onRenderTracked', e)
    })

    return {
      checked: ref(false)
    }
  }
}
</script>
