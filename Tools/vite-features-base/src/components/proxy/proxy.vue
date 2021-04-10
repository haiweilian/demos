<template>
  <div>{{ title }}</div>
</template>
<script setup>
import axios from "axios"
import { ref } from "vue"

let title = ref({})

axios.get("/api/todos/1").then((res) => {
  title.value = res.data
})

</script>
