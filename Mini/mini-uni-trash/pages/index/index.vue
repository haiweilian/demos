<template>
  <view class="content">
    <button type="default" @click="choosePhoto">拍照或从相册选择一张照片</button>
    <image :src="imgfile" mode="widthFix"></image>
    <view v-if="searchResults">
      <view v-if="searchResults.matched" style="width: 100%;text-align: center;">{{searchResults.matched.typename}}</view>
      <view v-else style="font-size: 14px;">
        <view v-for="(item, index) in searchResults.similars" :key="index" style="display: flex;">
          <view style="flex: 1;text-overflow: ellipsis;white-space: nowrap;overflow: hidden;margin-right: 20px;">{{item.keywords}}</view>
          <view>{{item.typename}}</view>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
  export default {
    data() {
      return {
        imgfile: '',
        searchResults: []
      }
    },
    methods: {
      // 选取照片
      choosePhoto() {
        uni.chooseImage({
          count: 1,
          success: (res) => {
            console.log(res)
            this.imgfile = res.tempFilePaths[0]
            this.readImage2Base64(this.imgfile)
          }
        })
      },
      // 由于图片转Base64的方法在跨端时API并不统一，所以我们需要根据条件编译，使用对应端的特定API来完成此功能。
      readImage2Base64(imgfile) {
        // #ifdef MP-WEIXIN
        wx.getFileSystemManager().readFile({
          filePath: imgfile,
          encoding: 'base64',
          success: (res) => {
            console.log(res)
            this.imageClassify(res.data)
          }
        })
        // #endif
      },
      // 调用百度AI，图片识别，返回识别结果
      imageClassify(b64) {
        uniCloud.callFunction({
          name: 'imageClassify',
          data: {
            image: b64
          },
          success: (res) => {
            console.log(res)
            this.parseResults(res.result.result)
          }
        })
      },
      // 处理识别结果
      parseResults(result) {
        let itemList = []
        let abs_result_index
        for(let i = 0; i < result.length; i++) {
          let item = result[i]
          if(item.score > .8) {
            abs_result_index = i
            break;
          }
          itemList.push(item.keyword + result.score)
        }
        
        // 如果包含了最佳匹配，则不需要弹出选择
        if(abs_result_index >= 0) {
          this.selectRecResult(result[abs_result_index].keyword)
          return
        }
        
        uni.showActionSheet({
          itemList: itemList,
          success: (res) => {
            this.selectRecResult(result[res.tapIndex].keyword)
          }
        })
      },
      // 查询垃圾分类结果
      selectRecResult(kw) {
        console.log(kw)
        uniCloud.callFunction({
          name: 'trashClassify',
          data: {
            keyword: kw
          },
          success: (res) => {
            console.log(res)
            this.searchResults = res.result
          }
        })
      }
    }
  }
</script>
