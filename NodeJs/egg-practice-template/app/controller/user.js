'use strict';

const Controller = require('egg').Controller;

/**
 * @Controller 用户管理
 */
class UserController extends Controller {
  /**
   * @summary 创建用户
   * @description 创建用户，记录用户账户/密码/类型
   * @router post /api/user
   * @request body createUserRequest *body
   * @response 200 baseResponse 创建成功
   */
  async create() {
    const { ctx, service } = this;

    ctx.validate(ctx.rule.createUserRequest);

    const payload = ctx.request.body || {};
    const res = await service.user.create(payload);

    ctx.helper.success({ ctx, res });
  }

  /**
   * @summary 删除单个用户
   * @description 删除单个用户
   * @router delete /api/user/{id}
   * @request path string *id eg:1 用户ID
   * @response 200 baseResponse 创建成功
   */
  async destroy() {
    const { ctx, service } = this;

    const { id } = ctx.params;
    await service.user.destroy(id);

    ctx.helper.success({ ctx });
  }

  /**
   * @summary 修改用户
   * @description 获取用户信息
   * @router put /api/user/
   * @request body createUserRequest *body
   * @response 200 baseResponse 创建成功
   */
  async update() {
    const { ctx, service } = this;

    ctx.validate(ctx.rule.createUserRequest);

    const { id } = ctx.params;
    const payload = ctx.request.body || {};
    await service.user.update(id, payload);

    ctx.helper.success({ ctx });
  }

  /**
   * @summary 获取单个用户
   * @description 获取用户信息
   * @router get /api/user/{id}
   * @request url baseRequest
   * @response 200 baseResponse 创建成功
   */
  async show() {
    const { ctx, service } = this;

    const { id } = ctx.params;
    const res = await service.user.show(id);

    ctx.helper.success({ ctx, res });
  }

  /**
   * @summary 获取所有用户(分页/模糊)
   * @description 获取用户信息
   * @router get /api/user
   * @request query integer *currentPage eg:1 当前页
   * @request query integer *pageSize eg:10 单页数量
   * @request query string search eg: 搜索字符串
   * @request query boolean isPaging eg:true 是否需要翻页
   * @response 200 baseResponse 创建成功
   */
  async index() {
    const { ctx, service } = this;

    const payload = ctx.query;
    const res = await service.user.index(payload);

    ctx.helper.success({ ctx, res });
  }
}

module.exports = UserController;
