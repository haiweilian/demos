<template>
  <div class="spu-selectbox">
    <div class="seleted-info">
      {{ JSON.stringify(selectedChecked) }}
    </div>
    <ul class="spu-list">
      <li class="spu-item" v-for="(item, index) in specList" :key="index">
        <p class="item-title">{{ item.name }}</p>
        <span
          class="item-tag"
          v-for="(v, k) in item.items"
          :class="{ 'active-tag': v.specStatus === 2, 'disable-tag': v.specStatus === 0 }"
          :key="k"
          :sku-id="v.id"
          @click="setTagChange(v, index)"
        >
          {{ v.name }}
        </span>
      </li>
    </ul>
  </div>
</template>
<script>
import baseData from "./mock.json";
import SkuStatusClass from "./skujs/index";
export default {
  data() {
    return {
      skuStatusClass: null,
      specList: [],
      selected: ["200", "010", "001"],
      selectedChecked: {},
    };
  },
  created() {
    this.skuStatusClass = new SkuStatusClass(baseData.skuListData, baseData.specListData);
    this.getSpecListStatus();
  },
  methods: {
    getSpecListStatus() {
      let selected = this.selected.filter((sku) => !!sku);
      this.specList = this.skuStatusClass.getSpecListStatus(selected);
      this.selectedChecked = this.skuStatusClass.getSkuGoods(selected);
    },
    setTagChange(v, index) {
      if (v.specStatus === 1) {
        this.selected[index] = v.id;
        this.getSpecListStatus();
      } else if (v.specStatus === 2) {
        this.selected[index] = null;
        this.getSpecListStatus();
      }
    },
  },
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
