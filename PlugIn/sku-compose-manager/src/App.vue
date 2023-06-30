<template>
  <div id="app">
    <button @click="swIndex = 0">SkuMy</button>
    <button @click="swIndex = 1">SkuManager</button>
    <button @click="swIndex = 2">SkuStatusClass</button>
    <SkuMy v-if="swIndex === 0"></SkuMy>
    <SkuManager v-if="swIndex === 1"></SkuManager>
    <SkuStatusClass v-if="swIndex === 2"></SkuStatusClass>
  </div>
</template>
<script>
import SkuMy from "./components/my/Sku";
import SkuManager from "./components/sku-manager/Sku";
import SkuStatusClass from "./components/sku-status-class/Sku";
export default {
  name: "App",
  components: {
    SkuMy,
    SkuManager,
    SkuStatusClass
  },
  data() {
    return {
      swIndex: 0
    };
  }
};
</script>
