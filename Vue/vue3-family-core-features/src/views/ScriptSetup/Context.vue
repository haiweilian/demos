<template>
  <br /><br /><br /><br />
  <div v-bind="attrs">child count {{ props.count }}</div>
  <button @click="emit('dec')">child dec</button>
</template>

<script setup>
import { defineEmits, useAttrs, useSlots } from 'vue'

const props = defineProps({
  count: Number
})

const emit = defineEmits(['dec'])

const attrs = useAttrs()

const slots = useSlots()

const name = 'Context'

defineExpose({
  name
})

console.log(attrs, slots)
</script>
