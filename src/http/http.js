// http/http.js
import axios from 'axios'
import qs from 'qs'
import base from './http-base'

/**
 * 扩展模块
 */
import './helper/http-loading'

/**
 * 定义请求统一导出。
 */
const http = {}

/**
 * 配置默认项。
 */
axios.defaults.timeout = 5000
axios.defaults.withCredentials = false

/**
 * 请求拦截，如果您想在请求前做些事情。
 */
axios.interceptors.request.use((config) => {
  return config
}, (error) => {
  return Promise.reject(error)
})

/**
 * 响应拦截，如果您想在请求后做些事情。
 */
axios.interceptors.response.use((response) => {
  return response
}, (error) => {
  return Promise.reject(error)
})

/**
 * restful风格路径参数替换。
 * @example toRestful('/users/{name}', {name: 'haiweilian'}) => '/users/haiweilian'
 */
const toRestful = (url, params) => {
  const _params = url.match(/(?<=\{).*?(?=\})/gi) || []
  _params.forEach(el => {
    url = url.replace('{' + el + '}', params[el])
    delete params[el]
  })
  return url
}

/**
 * 定义 Content-Type, 选择一个常用的作为默认。
 */
const ContentType = {
  json: 'application/json;charset=utf-8',
  urlencoded: 'application/x-www-form-urlencoded;charset=utf-8'
}

/**
 * 定义/处理请求。
 */
const request = (options) => {
  let {
    method,
    action,
    params,
    data,
    type,
    config
  } = options

  /**
   * 合并初始配置, 自定义的判断。
   */
  config = Object.assign({
    loading: true,
    contentType: 'urlencoded'
  }, config)

  /**
   * 判断环境变量，获取正式/测试并处理请求路径。
   */
  if (process.env.NODE_ENV === 'development') {
    action = toRestful(base.development[type] + action, params || data)
  } else {
    action = toRestful(base.production[type] + action, params || data)
  }

  /**
   * 设置 Content-Type 如果是 POST && urlencoded 需要序列化。
   */
  axios.defaults.headers['Content-Type'] = ContentType[config.contentType]
  if (method === 'post' && config.contentType === 'urlencoded') {
    data = qs.stringify(data)
  }

  /**
   * 返回请求。
   */
  return axios.request({
    url: action,
    method: method,
    data: data,
    params: params,
    ...config
  })
}

/**
 * 定义请求方式。
 */
['get', 'post', 'put', 'delete'].forEach(method => {
  http[method] = (
    action,
    params,
    type = 1,
    config = {}
  ) => {
    if (method === 'get') {
      return request({
        method: method,
        action: action,
        params: params,
        type: type,
        config: config
      })
    } else {
      return request({
        method: method,
        action: action,
        data: params,
        type: type,
        config: config
      })
    }
  }
})

export default http
