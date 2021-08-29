<template>
  <div id="nav">
    <router-link to="/ReactivityTodo">响应性Todo</router-link> |
    <router-link to="/ReactivityApi">响应性API</router-link> |
    <router-link to="/LifecycleHooks">生命周期</router-link> |
    <router-link to="/ProvideInject">Provide/Inject</router-link> |
    <router-link to="/Teleport">组件Teleport</router-link> |
    <router-link to="/Suspense">组件Suspense</router-link> |
    <router-link to="/MultipleModel">多个v-model</router-link> |
    <router-link to="/ScriptSetup">ScriptSetup</router-link> |
    <router-link to="/RouterNext?id=1">RouterNext</router-link> |
    <router-link to="/VuexNext">VuexNext</router-link> |
    <router-link to="/PiniaNext">PiniaNext</router-link>
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
  font-size: 12px;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
