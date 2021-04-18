<template>
  <div>
    <p>this.$route --> useRoute</p>
    <p>this.$router --> useRouter</p>
    <button @click="goback">返回</button>
    <br />
    <button @click="getQuery">获取参数</button>
    <br />
    <router-link to="/RouterNext/Slot" custom v-slot="{ href, navigate }">
      <div>
        <p>1、custom 禁用 a 标签解析。</p>
        <p>2、v-slot 暴露出内部函数, route, navigate, isActive, isExactActive</p>
        <p>3、href {{ href }}</p>
        <button @click="navigate">router-link v-slot to {{ href }}</button>
      </div>
    </router-link>
    <router-view v-slot="{ Component, route }">
      <p>1、同 v-slot 暴露出内部函数。Component、route</p>
      <p>2、route {{ route }}</p>
      <component :is="Component"></component>
    </router-view>
  </div>
</template>
<script>
import { useRouter, useRoute, onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
export default {
  setup() {
    onBeforeRouteLeave((to, from, next) => {
      const is = confirm('确认离开吗？')
      if (is) {
        next()
      } else {
        next(false)
      }
    })

    onBeforeRouteUpdate((to, from) => {})

    console.log('useRoute', useRoute())
    console.log('useRouter', useRouter())
    const route = useRoute()
    const router = useRouter()

    console.log(router.getRoutes())
    console.log(router.hasRoute('/VuexNext'))

    const goback = () => {
      router.go(-1)
    }

    const getQuery = () => {
      alert(route.query.id)
    }

    return {
      goback,
      getQuery
    }
  }
}
</script>
