<template>
  <div id="app">
    <h2 class="">state：{{ $store.state.counter }}</h2>
    <h2 class="">getters：{{ $store.getters.doubleCount }}</h2>
    <div class="">
      <button @click="$store.commit('add')">触发mutations</button>
      <button @click="$store.dispatch('add')">触发actions</button>
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {

    }
  },
  created () {
    // this.$store.state = null
  }
}
</script>
