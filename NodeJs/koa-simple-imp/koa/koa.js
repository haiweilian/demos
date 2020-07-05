const http = require("http");
const context = require("./context");
const request = require("./request");
const response = require("./response");

class Koa {
  constructor() {
    // 中间件集合
    this.middlewares = [];
  }
  // 创建服务，内部调用 http.createServer 方法
  listen(...args) {
    const server = http.createServer(async (req, res) => {
      // 创建上下文
      const ctx = this.createContext(req, res);
      // 组合中间件
      const fn = this.compose(this.middlewares);
      await fn(ctx);
      // 返回结果
      res.end(ctx.body);
    });
    server.listen(...args);
  }
  // 收集中间件
  use(middleware) {
    this.middlewares.push(middleware);
  }
  // 创建上下文，一下各种赋值是为了使用方便
  createContext(req, res) {
    const ctx = Object.create(context);

    ctx.request = Object.create(request);
    ctx.response = Object.create(response);

    ctx.req = ctx.request.req = req;
    ctx.res = ctx.response.res = res;

    return ctx;
  }
  // 中间件组合
  compose(middlewares) {
    return function (ctx) {
      dispatch(0);
      function dispatch(i) {
        const fn = middlewares[i];
        if (!fn) {
          return Promise.resolve();
        }
        return Promise.resolve(
          fn(ctx, function next() {
            return dispatch(i + 1);
          })
        );
      }
    };
  }
}

module.exports = Koa;
