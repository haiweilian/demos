<template>
  <div class="spu-selectbox">
    <div class="seleted-info">
      <p class="prod-title">{{ baseData.title }}</p>
      <div class="seleted-summary">
        <div class="has-selected">
          <span class="selected-txt">已选</span>
          <ul class="selected-list">
            <li class="selected-item" v-for="item in hasSelectedList" :key="item.paramId">{{ item.valueValue }}</li>
          </ul>
        </div>
        <br />
        <p class="sku-info">当前所选的 sku 最低价格：{{ currentSeletedPrice || "---" }}</p>
        <p class="sku-info">当前所选的 sku 总库存：{{ currentTotalCount }}</p>
      </div>
    </div>
    <ul class="spu-list" v-if="baseData.skuParamVoList.length">
      <li class="spu-item" v-for="(item, index) in baseData.skuParamVoList" :key="index">
        <p class="item-title">{{ item.paramValue }}</p>
        <span
          :class="[
            'item-tag',
            item.paramId,
            v.valueId,
            { 'active-tag': activeSkuTagMap[item.paramId] === v.valueId },
            { 'disable-tag': emptyMap[item.paramId] && emptyMap[item.paramId].includes(v.valueId) },
          ]"
          @click="selectTag(item.paramId, v.valueId)"
          v-for="(v, k) in item.valueList"
          :key="k"
          >{{ v.valueValue }}</span
        >
      </li>
    </ul>
    <div class="action-btn-box fixed_bottom">
      <button :class="['btn-box', { 'btn-disable': hasSelectedList.length !== baseData.skuParamVoList.length }]">立即购买</button>
    </div>
  </div>
</template>
<script>
import baseData from "./mock.json";
import SkuManage, { joinKVStr, joinAttrStr } from "./skujs/index";

// 当前选择的 sku属性对应的库存、价格、spuDId等信息
let currentSelectSkuRst = {};
let skuManage = null;
export default {
  data() {
    return {
      // #region data
      baseData: baseData,
      // 应该置灰不可点击的按钮
      emptyMap: {},
      activeSkuTagMap: {},
      // 已经选中的属性信息
      hasSelectedList: [],
      // 当前选中的 sku属性对应的价格
      // 当前选中的 sku属性总库存
      currentSeletedPrice: 0,
      currentTotalCount: 0,
      skuRankList: [],
      // #endregion
    };
  },
  created() {
    this.computeSkuData();
    skuManage = new SkuManage(baseData.skuParamVoList, this.skuRankList);
    this.activeSkuMapUpdate();
  },
  methods: {
    // #region methods
    selectTag(paramId, valueId) {
      console.log("selectTag", paramId, valueId);
      if (this.emptyMap && this.emptyMap[paramId] && this.emptyMap[paramId].some((item) => item === valueId)) {
        // 当前点击按钮已经被置灰，不做响应
        return;
      }
      if (this.activeSkuTagMap[paramId] === valueId) {
        // 如果已经点选了，再次点选就取消点选
        this.$delete(this.activeSkuTagMap, paramId);
      } else {
        this.$set(this.activeSkuTagMap, paramId, valueId);
      }
      this.activeSkuMapUpdate();
    },
    // activeSkuMap 发生改变
    activeSkuMapUpdate() {
      currentSelectSkuRst = skuManage.excuteBySeleted(this.activeSkuTagMap);
      let hasSelectedList = [];
      let valueInfo = null;
      this.baseData.skuParamVoList.forEach((item) => {
        valueInfo = item.valueList.filter((v) => v.valueId === this.activeSkuTagMap[item.paramId])[0];
        if (valueInfo) {
          hasSelectedList.push({
            paramId: item.paramId,
            valueId: valueInfo.valueId,
            valueValue: valueInfo.valueValue,
          });
        }
      });
      this.hasSelectedList = hasSelectedList;
      this.emptyMap = this.getEmptyMap();
      // 取最低价格进行显示
      this.currentSeletedPrice = currentSelectSkuRst.currentRst ? Math.min(...currentSelectSkuRst.currentRst.priceArr) : 0;
      this.currentTotalCount = currentSelectSkuRst.currentRst ? currentSelectSkuRst.currentRst.totalCount : 0;
      console.log("tag change done:", this.emptyMap, currentSelectSkuRst);
    },
    // 获取库存为 0 的sku属性，依赖于 currentSelectSkuRst
    getEmptyMap() {
      let kv = null;
      // key 为 paramId，值为以 valueId 组成的数组，在这个数组中的 valueId 就是需要置灰的
      const emptyMap = {};
      // ['10_100', '20_200']
      currentSelectSkuRst.nextEmptyKV.forEach((item) => {
        kv = item.split(joinKVStr);
        emptyMap[kv[0]] = (emptyMap[kv[0]] || []).concat(kv[1]);
      });
      return emptyMap;
    },
    computeSkuData() {
      let spudSortParams = null;
      /* tslint:disable */
      this.skuRankList = Object.freeze(
        this.baseData.allSkuVoList.map((item) => {
          // 按照 paramId 从小到大排序
          spudSortParams = item.spudParams.sort((a, b) => a.paramId - b.paramId);
          return {
            spuDId: item.spudId,
            paramIdJoin: spudSortParams.map((v) => v.paramId + joinKVStr + v.valueId).join(joinAttrStr),
            priceRange: [item.minPrice, item.maxPrice],
            count: +item.stock,
          };
        })
      );
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
