<template>
  <div id="app">
    <button @click="swIndex = 0">SkuManager</button>
    <button @click="swIndex = 1">SkuStatusClass</button>
    <SkuManager v-if="swIndex === 0"></SkuManager>
    <SkuStatusClass v-if="swIndex === 1"></SkuStatusClass>
  </div>
</template>
<script>
import SkuManager from "./components/sku-manager/Sku";
import SkuStatusClass from "./components/sku-status-class/Sku";
export default {
  name: "App",
  components: {
    SkuManager,
    SkuStatusClass,
  },
  data() {
    return {
      swIndex: 0,
    };
  },
};
</script>
