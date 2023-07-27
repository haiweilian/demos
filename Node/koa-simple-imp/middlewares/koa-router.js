class Router {
  constructor() {
    this.stack = [];
  }

  // 注册路由信息，收集到一个集合中。
  register(path, methods, middleware) {
    let route = { path, methods, middleware };
    this.stack.push(route);
  }

  // get 请求。
  get(path, middleware) {
    this.register(path, "get", middleware);
  }

  // post 请求。
  post(path, middleware) {
    this.register(path, "post", middleware);
  }

  // 暴露出一个总的路由中间件。
  routes() {
    let stock = this.stack;

    return async function (ctx, next) {
      let currentPath = ctx.url;
      let route;

      // 根据 path 和 method 匹配对应对应的路由
      for (let i = 0; i < stock.length; i++) {
        let item = stock[i];
        if (currentPath === item.path && item.methods.indexOf(ctx.method) >= 0) {
          route = item.middleware;
          break;
        }
      }

      // 执行对应的函数，返回结果。
      if (typeof route === "function") {
        route(ctx, next);
        return;
      }

      await next();
    };
  }
}

module.exports = Router;
