'use strict';

const Service = require('egg').Service;

class ActionTokenService extends Service {
  /**
   * 生成 token 令牌
   * @param {*} id *
   */
  async apply(id) {
    const { ctx } = this;
    return ctx.app.jwt.sign({
      data: { id },
      exp: Math.floor(Date.now() / 1000 + (60 * 60 * 7)),
    }, ctx.app.config.jwt.secret);
  }
}

module.exports = ActionTokenService;
