import http from '../http'

/**
 * restful 测试
 */
export function getUser (params, config = {}) {
  return http.get('/users/haiweilian', params, 1, config)
}
