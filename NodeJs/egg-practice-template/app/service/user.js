'use strict';

const Service = require('egg').Service;

class UserService extends Service {

  /**
   * 创建用户
   * @param {*} payload *
   */
  async create(payload) {
    const { ctx } = this;
    payload.password = await ctx.genHash(payload.password);
    return ctx.model.User.create(payload);
  }

  /**
   * 删除用户
   * @param {*} id *
   */
  async destroy(id) {
    const { ctx } = this;
    const user = await ctx.service.user.find(id);
    if (!user) {
      ctx.throw(404, 'user not found');
    }
    return ctx.model.User.findByIdAndRemove(id);
  }

  /**
   * 修改用户
   * @param {*} id *
   * @param {*} payload *
   */
  async update(id, payload) {
    const { ctx } = this;
    const user = await ctx.service.user.find(id);
    if (!user) {
      ctx.throw(404, 'user not found');
    }
    return ctx.model.User.findByIdAndUpdate(id, payload);
  }

  /**
   * 查看单个用户
   * @param {*} id *
   */
  async show(id) {
    const { ctx } = this;
    const user = await ctx.service.user.find(id);
    if (!user) {
      ctx.throw(404, 'user not found');
    }
    return ctx.model.User.findById(id).populate('role');
  }

  /**
   * 查看用户列表
   * @param {*} payload *
   */
  async index(payload) {
    const { ctx } = this;
    const { currentPage, pageSize, isPaging, search } = payload;
    let res = [];
    let count = 0;
    const skip = ((Number(currentPage)) - 1) * Number(pageSize || 10);
    if (isPaging) {
      if (search) {
        res = await ctx.model.User.find({ mobile: { $regex: search } }).populate('role').skip(skip)
          .limit(Number(pageSize))
          .sort({ createdAt: -1 })
          .exec();
        count = res.length;
      } else {
        res = await ctx.model.User.find({}).populate('role').skip(skip)
          .limit(Number(pageSize))
          .sort({ createdAt: -1 })
          .exec();
        count = await ctx.model.User.count({}).exec();
      }
    } else {
      if (search) {
        res = await ctx.model.User.find({ mobile: { $regex: search } }).populate('role').sort({ createdAt: -1 })
          .exec();
        count = res.length;
      } else {
        res = await ctx.model.User.find({}).populate('role').sort({ createdAt: -1 })
          .exec();
        count = await ctx.model.User.count({}).exec();
      }
    }
    return { count, list: res, pageSize: Number(pageSize), currentPage: Number(currentPage) };
  }

  /**
   * 删除多个用户
   * @param {*} payload *
   */
  async removes(payload) {
    const { ctx } = this;
    return ctx.model.User.remove({ _id: { $in: payload } });
  }

  /**
   * 根据手机号查找
   * @param {*} mobile *
   */
  async findByMobile(mobile) {
    const { ctx } = this;
    return ctx.model.User.findOne({ mobile });
  }

  /**
   * 查找用户
   * @param {*} id *
   */
  async find(id) {
    const { ctx } = this;
    return ctx.model.User.findById(id);
  }

  /**
   * 更新用户信息
   * @param {*} id *
   * @param {*} values *
   */
  async findByIdAndUpdate(id, values) {
    const { ctx } = this;
    return ctx.model.User.findByIdAndUpdate(id, values);
  }
}

module.exports = UserService;
