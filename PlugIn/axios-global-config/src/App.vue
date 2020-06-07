<template>
  <div id="app">
    <el-button @click="handleSendRequestOne">单次请求</el-button>
    <el-button @click="handleSendRequestOneNoLoading">单次请求不添加Loading</el-button>
    <el-button @click="handleSendRequestThree">同时发3次请求</el-button>
    <el-button @click="handleSendRequestThreeWithInterval">间隔10ms发3次请求</el-button>
  </div>
</template>
<script>
import { getUser } from './http/test/loading'
export default {
  data () {
    return {

    }
  },
  methods: {
    handleSendRequestOne () {
      getUser()
    },
    handleSendRequestOneNoLoading () {
      getUser({}, { loading: false })
    },
    handleSendRequestThree () {
      getUser()
      getUser()
      getUser()
    },
    handleSendRequestThreeWithInterval () {
      let count = 0
      const time = setInterval(() => {
        count++
        if (count === 3) {
          clearInterval(time)
        }
        getUser()
      })
    }
  }
}
</script>
<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
