<template>
  <button @click="disabled = !disabled">切换渲染位置</button>
  <teleport to="body" :disabled="disabled">
    <div class="mask"><button>切换内容位置，审查元素查看</button></div>
    <input type="text">
  </teleport>
</template>
<script>
export default {
  data () {
    return {
      disabled: false
    }
  }
}
</script>
