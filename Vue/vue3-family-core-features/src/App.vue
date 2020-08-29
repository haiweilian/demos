<template>
  <div id="app">
    <div id="nav">
      <router-link to="/ReactivityApis">响应性系统Todo</router-link> |
      <router-link to="/LifecycleHooks">生命周期</router-link> |
      <router-link to="/DependencyInjection">依赖注入</router-link> |
      <router-link to="/TemplateRefs">模板Refs</router-link> |
      <router-link to="/ReactivityUtilities">工具集</router-link> |
      <router-link to="/AdvancedReactivityAPIs">高级响应式系统</router-link> |
      <router-link to="/RouterNext">Router Next</router-link> |
      <router-link to="/VuexNext">Vuex Next</router-link>
    </div>
    <router-view />
  </div>
</template>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
