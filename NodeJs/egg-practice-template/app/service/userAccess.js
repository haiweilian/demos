'use strict';

const Service = require('egg').Service;

class UserAccessService extends Service {
  /**
   * 登录
   * @param {*} payload *
   */
  async login(payload) {
    const { ctx, service } = this;

    const user = await service.user.findByMobile(payload.mobile);
    if (!user) {
      ctx.throw(404, 'user not found');
    }

    const verifyPsw = await ctx.compare(payload.password, user.password);
    if (!verifyPsw) {
      ctx.throw(404, 'user password is error');
    }

    return { token: await service.actionToken.apply(user._id) };
  }

  /**
   * 登出
   */
  async logout() {
    return null;
  }

  /**
   * 获取当前登录的用户
   */
  async current() {
    const { ctx, service } = this;

    const id = ctx.state.user.data._id; // ctx.state.user 可以提取到JWT编码的data
    const user = await service.user.find(id);

    if (!user) {
      ctx.throw(404, 'user is not found');
    } else {
      delete user.password;
    }

    return user;
  }
}

module.exports = UserAccessService;
