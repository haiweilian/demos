<template>
  <input type="text" :value="firstName" @input="updateFirstName($event)" />
  <input type="text" :value="lastName" @input="updateLastName($event)" />
</template>
<script>
import { watchEffect } from 'vue'
export default {
  props: {
    modelValue: String,
    firstName: String,
    lastName: String
  },
  emits: ['update:firstName', 'update:lastName', 'update:modelValue'],
  setup(props, ctx) {
    console.log(props, ctx)

    const updateFirstName = (event) => {
      ctx.emit('update:firstName', event.target.value)
    }

    const updateLastName = (event) => {
      ctx.emit('update:lastName', event.target.value)
    }

    watchEffect(() => {
      ctx.emit('update:modelValue', props.firstName + props.lastName)
    })

    return {
      updateFirstName,
      updateLastName
    }
  }
}
</script>
