'use strict';

const Controller = require('egg').Controller;

class PagesController extends Controller {
  async user() {
    const { ctx } = this;
    await ctx.render('pages/user.nj', {});
  }
}

module.exports = PagesController;
