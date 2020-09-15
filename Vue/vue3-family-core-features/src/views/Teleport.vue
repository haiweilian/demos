<template>
  <teleport to="body">
    <div class="mask"><button>虽然是逻辑写在#app，但是渲染在了 body 后</button></div>
  </teleport>
  <teleport to="body">
    <div class="mask"><button>虽然是逻辑写在#app，但是渲染在了 body 后</button></div>
  </teleport>
</template>
<script>
export default {

}
</script>
