// http/helper/http-loading.js
import axios from 'axios'
import * as loadinging from './http-loading-helper'

/**
 * 请求拦截并判断此请求是否参与loading
 */
axios.interceptors.request.use(config => {
  if (config.loading) {
    loadinging.showFullScreenLoading()
  }
  return config
}, error => {
  return Promise.reject(error)
})

/**
 * 响应拦截并判断此请求是否参与loading
 */
axios.interceptors.response.use(response => {
  if (response.config.loading) {
    loadinging.tryHideFullScreenLoading()
  }
  return response
}, error => {
  loadinging.tryHideFullScreenLoading()
  return Promise.reject(error)
})
