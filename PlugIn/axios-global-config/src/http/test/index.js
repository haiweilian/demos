// http/test/index.js
import http from '../http'

/**
 * restful 测试
 */
export function restfulTest (params) {
  return http.get('/users/{name}', params, 1)
}

/**
 * get 测试
 */
export function getTest (params) {
  return http.get('/bloc/template/listModifyTemplateArea', params, 3)
}

/**
 * post 测试
 */
export function postTest (params) {
  return http.post('/bloc/template/insertModifyTemplateArea', params, 3)
}

/**
 * postJson 测试
 */
export function postTestJSON (params) {
  return http.post('/bloc/offer/updateT_Comp_FeeF_TAX', params, 3, { contentType: 'json' })
}
