<template>
  <div>
    <h1>{{ user.name }}</h1>
    <h1>{{ user.age }}</h1>
  </div>
</template>
<script>
export default {
  async setup() {
    const fetchUser = () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve({ name: 'Carlo', age: '20' })
          //reject("获取信息失败！");
        }, 3000)
      })
    }

    const user = await fetchUser()

    return { user }
  }
}
</script>
