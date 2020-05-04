// http/helper/http-loading-helper.js
import { Loading } from 'element-ui'

let needLoadingRequestCount = 0
let loading

/**
 * 开始 loading。注：loading 可以使用任意插件。
 */
function startLoading () {
  console.log('startLoading =============')
  loading = Loading.service({
    lock: true,
    text: '加载中……',
    background: 'rgba(0, 0, 0, 0.7)'
  })
}

/**
 * 结束 loading
 */
function endLoading () {
  console.log('endLoading==========')
  loading.close()
}

/**
 * 当有请求的时候并且没有loading，开始 loading。并记录请求次数 + 1。
 */
export function showFullScreenLoading () {
  if (needLoadingRequestCount === 0) {
    startLoading()
  }
  needLoadingRequestCount++
}

/**
 * 当响应请求的时候，记录请求次数 - 1。如果请求次数为0，则关闭 loading。
 * 注：合并请求，延迟关闭(setTimeout)就能和下次请求连接上, 避免闪屏。
 */
export function tryHideFullScreenLoading () {
  if (needLoadingRequestCount <= 0) return
  needLoadingRequestCount--
  if (needLoadingRequestCount === 0) {
    setTimeout(() => {
      endLoading()
    }, 200)
  }
}
