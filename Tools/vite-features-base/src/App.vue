<script setup>
  import Css from './components/css/css.vue'
  import Static from './components/static/static.vue'
  import Json from './components/json/json.vue'
  import Glob from './components/glob/glob.vue'
  import Env from '~/components/env/env.vue'
  import Proxy from '~/components/proxy/proxy.vue'
  import Virtual from '~/components/virtual/virtual.vue'
  import Transform from '~/components/transform/transform.vue'
  // This starter template is using Vue 3 experimental <script setup> SFCs
  // Check out https://github.com/vuejs/rfcs/blob/script-setup-2/active-rfcs/0000-script-setup.md
</script>

<template>
  <h2>CSS</h2>
  <Css/>
  <h2>静态资源处理</h2>
  <Static/>
  <h2>JSON</h2>
  <Json/>
  <h2>Glob 导入</h2>
  <Glob/>
  <h2>环境变量与模式</h2>
  <Env/>
  <h2>服务代理：server.proxy </h2>
  <Proxy/>
  <h2>插件API：虚拟文件</h2>
  <Virtual/>
  <h2>插件API：转换自定义类型</h2>
  <Transform/>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h2 {
  border-bottom: 2px solid #000;
}

h6 {
  border-bottom: 1px solid #ccc;
}
</style>
