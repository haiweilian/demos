<template>
  <pre>{{JSON.stringify(env, null, 2)}}</pre>
</template>

<script>
export default {
  setup() {
    const env = import.meta.env
    return {
      env
    }
  }
}
</script>
