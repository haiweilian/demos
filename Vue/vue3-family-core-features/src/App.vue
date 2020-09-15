<template>
  <div id="nav">
    <router-link to="/ReactivityApis">响应性系统TodoMv</router-link> |
    <router-link to="/LifecycleHooks">生命周期</router-link> |
    <router-link to="/DependencyInjection">依赖注入</router-link> |
    <router-link to="/TemplateRefs">模板Refs</router-link> |
    <router-link to="/Teleport">内置组件Teleport</router-link> |
    <router-link to="/MultipleModel">多个 v-model 绑定</router-link> |
    <router-link to="/RouterNext?id=1">Router Next</router-link> |
    <router-link to="/VuexNext">Vuex Next</router-link>
  </div>
  <router-view />
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
