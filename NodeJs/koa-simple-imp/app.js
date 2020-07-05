// const Koa = require("koa");
// const Router = require("koa-router");
// const static = require("koa-static");

const Koa = require("./koa/koa");
const Router = require("./middlewares/koa-router");
const static = require("./middlewares/koa-static");

const app = new Koa();
const router = new Router();

app.use(static(__dirname + "/public"));

router.get("/api/user", (ctx, next) => {
  ctx.body = "user";
});

app.use(router.routes());

app.listen(3000);
