<template>
  <div class="spu-selectbox">
    <div class="seleted-info">
      {{ JSON.stringify(selectedChecked) }}
    </div>
    <ul class="spu-list">
      <li class="spu-item" v-for="(attr, index) in specList" :key="index">
        <p class="item-title">{{ attr.name }}</p>
        <span
          class="item-tag"
          v-for="opt in attr.options"
          :key="opt.value"
          :class="{ 'active-tag': selectedChecked[attr.name] === opt.value, 'disable-tag': !isSkuValid(attr.name, opt.value) }"
          @click="setTagChange(attr.name, opt.value)"
        >
          {{ opt.value }}
        </span>
      </li>
    </ul>
  </div>
</template>
<script>
import { getAttrs, getSkus } from "./skujs/cartesian";
export default {
  data() {
    return {
      specList: getAttrs,
      specSkus: getSkus,
      selectedChecked: {}
    };
  },
  created() {},
  methods: {
    // 取消或选中
    setTagChange(attrKey, optValue) {
      this.selectedChecked = {
        ...this.selectedChecked,
        [attrKey]: this.selectedChecked[attrKey] === optValue ? undefined : optValue
      };
    },
    // 判断是否可选
    isSkuValid(attrKey, optValue) {
      // 先假设当前属性值已选中，拼入已选对象里
      const tempSelectedSku = {
        ...this.selectedChecked,
        [attrKey]: optValue
      };

      // 过滤出已选对象中属性值不为空的
      const skuToBeChecked = Object.keys(tempSelectedSku).filter(k => Boolean(tempSelectedSku[k]));
      console.log(tempSelectedSku, skuToBeChecked);

      // 在skuList里找到所有包含已选择属性的sku且库存>0的sku
      const filteredSkuList = this.specSkus.filter(sku => skuToBeChecked.every(skuKey => tempSelectedSku[skuKey] === sku.skuInfo[skuKey] && sku.stock > 0));

      return filteredSkuList.length > 0;
    }
  }
};
</script>
<style>
.spu-selectbox {
  --boxPaddingH: 20px;
  position: relative;
  color: #000;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  background-color: #fff;
}
.seleted-info {
  overflow: hidden;
}
.prod-title {
  font-size: 14px;
}
.has-selected {
  height: 40px;
  font-size: 12px;
}
.selected-txt {
  display: inline-block;
  color: #7f7f7f;
}
.selected-list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-width: 220px;
}
.selected-item {
  display: inline-block;
  margin-right: 6px;
}
.sku-info {
  margin: 0;
  font-family: myFont;
  font-size: 15px;
}
.spu-list {
  list-style: none;
  overflow: scroll;
  padding: 0 var(--boxPaddingH);
  background-color: #f8f8f8;
}
.spu-list::-webkit-scrollbar {
  display: none;
}
.spu-item {
  /* padding-bottom: 6px; */
  font-size: 13px;
}
.item-title {
  color: #7f7f7f;
  margin-bottom: 10px;
}
.item-tag {
  display: inline-block;
  margin-right: 10px;
  margin-bottom: 10px;
  padding: 9px 12px;
  box-sizing: border-box;
  border: 2px solid #fff;
  color: #000;
  background-color: #fff;
  transition: all 0.1s;
}
.item-tag.active-tag {
  border-color: #313132;
}
.item-tag.disable-tag {
  color: #aaa;
}
.action-btn-box {
  padding: 9px var(--boxPaddingH);
}
.btn-box {
  width: 100%;
  padding: 12px 0;
  font-size: 15px;
  color: #fff;
  border: none;
  outline: none;
  border-radius: 6px;
  background-color: #ff4e15;
}
.btn-box.btn-disable {
  opacity: 0.4;
}
.btn-type {
  text-align: center;
  font-size: 15px;
}
</style>
