// miniprogram/pages/getbook/getbook.js
Page({
  data: {
    title: '',
    coverurl: ''
  },
  btnScanCode() {
    wx.scanCode({
      onlyFromCamera: true,
      success: (res) => {
        console.log(res)
        wx.showLoading({
          title: '正在获取信息',
        })
        wx.cloud.callFunction({
          name: 'getbook',
          data: {
            isbn: res.result
          },
          success: ({result}) => {
            console.log(result)
            wx.hideLoading({
              success: (res) => {},
            })
            this.setData({
              title: result.title,
              coverurl: result.coverurl
            })
          }
        })
      }
    })
  }
})
