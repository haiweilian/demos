<template>
  <div>
    <p>this.$route --> useRoute</p>
    <p>this.$router --> useRouter</p>
    <button @click="goback">返回</button>
    <br />
    <button @click="getQuery">获取参数</button>
  </div>
</template>
<script>
import { useRouter, useRoute } from 'vue-router'
export default {
  setup() {
    console.log('useRoute', useRoute())
    console.log('useRouter', useRouter())
    const route = useRoute()
    const router = useRouter()

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
