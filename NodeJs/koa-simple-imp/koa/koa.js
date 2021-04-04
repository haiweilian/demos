const http = require("http");
const context = require("./context");
const request = require("./request");
const response = require("./response");

class Koa {
  constructor() {
    this.middlewares = []; // 中间件集合
  }

  // 创建服务，内部调用 http.createServer 方法。
  listen(...args) {
    const server = http.createServer(async (req, res) => {
      // 创建上下文
      const ctx = this.createContext(req, res);

      // 组合中间件
      const compose = this.compose(this.middlewares);
      await compose(ctx);

      // 返回结果
      res.end(ctx.body);
    });

    server.listen(...args);
  }

  // 创建上下文，一下各种赋值是为了使用方便。
  createContext(req, res) {
    const ctx = Object.create(context);

    // Koa 抽象 request/response 的对象。
    ctx.request = Object.create(request);
    ctx.response = Object.create(response);

    // Node 的 request/response 对象。
    ctx.req = ctx.request.req = req;
    ctx.res = ctx.response.res = res;

    return ctx;
  }

  // 收集中间件，存到一个集合中。
  use(middleware) {
    this.middlewares.push(middleware);
  }

  // 中间件组合，本质上就是一个嵌套的高阶函数，外层的中间件嵌套着内层的中间件。
  // 有点像递归的机制，一层嵌套一层。调用 next 之前是 "递"，之后是 "归"。
  compose(middlewares) {
    return function (ctx) {
      // 从下标为 0 开始执行中间件。
      dispatch(0);
      function dispatch(i) {
        // 找出数组中存放的相应的中间件
        const middleware = middlewares[i];

        // 不存在返回成功，最后一个中间件调用 next 也不会报错。
        if (!middleware) {
          return Promise.resolve();
        }
        return Promise.resolve(
          middleware(
            // 第一个参数是 ctx。
            ctx,
            // 第二个参数是 next，允许继续进入下一个中间件。
            function next() {
              return dispatch(i + 1);
            }
          )
        );
      }
    };
  }
}

module.exports = Koa;
