// const Koa = require("koa");
// const Router = require("koa-router");

const Koa = require("./koa/koa");
const Router = require("./middlewares/koa-router");

const app = new Koa();
const router = new Router();

// 顺序测试 1->2->3->4->5->6
app.use(async (ctx, next) => {
  console.log(1);
  await next();
  console.log(6);
});
app.use(async (ctx, next) => {
  console.log(2);
  await next();
  console.log(5);
});
app.use(async (ctx, next) => {
  console.log(3);
  await next();
  console.log(4);
});

// 路由测试
router.get("/get", (ctx, next) => {
  ctx.body = "get";
});
router.get("/post", (ctx, next) => {
  ctx.body = "post";
});
app.use(router.routes());

// 监听端口
app.listen(3000, function () {
  console.log("listen at 3000");
});
