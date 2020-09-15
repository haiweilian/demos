<template>
  <p>name: {{name}}</p>
  <p>firstName: {{firstName}}</p>
  <p>lastName: {{lastName}}</p>
  <user-name v-model="name" v-model:first-name="firstName" v-model:last-name="lastName"></user-name>
</template>
<script>
import { reactive, toRefs } from 'vue'
import UserName from './MultipleModel/UserName.vue'
export default {
  components: {
    UserName
  },
  setup() {
    const state = reactive({
      name: 'lhw',
      firstName: 'l',
      lastName: 'hw'
    })

    return {
      ...toRefs(state)
    }
  }
}
</script>
