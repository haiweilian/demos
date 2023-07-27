/**
 * 对响应进行扩展
 */
module.exports = {
  get body() {
    return this._body;
  },
  set body(val) {
    this._body = val;
  },
};
