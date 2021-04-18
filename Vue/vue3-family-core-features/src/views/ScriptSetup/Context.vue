<script setup>
import { defineProps, defineEmit, useContext } from 'vue'

// setup(props, ctx) == props
const props = defineProps({
  count: Number
})

// emit
const emit = defineEmit(['dec'])

// setup(props, ctx) == ctx
const { attrs, slots, expose } = useContext()

const name = 'Context'

expose({
  name
})

console.log(attrs, slots)
</script>
<template>
  <br /><br /><br /><br />
  <div v-bind="attrs">child count {{ props.count }}</div>
  <button @click="emit('dec')">child dec</button>
</template>
