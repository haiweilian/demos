var Koa = require("koa");
var app = new Koa();
var Router = require("koa-router")();
const fs = require("fs");

Router.get("/", async (ctx) => {
  const html = fs.readFileSync("./fs/index.html", "utf-8");
  ctx.body = html;
});

// 设置为强缓存
Router.get("/cache-control", async (ctx) => {
  const getResource = () => {
    return new Promise((res) => {
      fs.readFile("./fs/a.txt", (err, data) => {
        if (err) {
          return;
        }
        res(data);
      });
    });
  };
  console.log("【cache-control】不缓存的时候会打印");
  ctx.set("Cache-Control", "max-age=10"); //设置强缓存，过期时间为10秒
  ctx.body = await getResource();
});

// 协商缓存，编辑时间变化
Router.get("/last-modified", async (ctx) => {
  const ifModifiedSince = ctx.request.header["if-modified-since"];
  const getResource = () => {
    return new Promise((res) => {
      fs.stat("./fs/a.txt", (err, stats) => {
        if (err) {
          console.log(err);
        }
        res(stats);
      });
    });
  };
  let resource = await getResource();
  // atime	Access Time	访问时间
  // 最后一次访问文件（读取或执行）的时间
  // ctime	Change Time	变化时间
  // 最后一次改变文件（属性或权限）或者目录（属性或权限）的时间
  // mtime	Modify Time	修改时间
  // 最后一次修改文件（内容）或者目录（内容）的时间
  if (ifModifiedSince === resource.mtime.toGMTString()) {
    //把具体的日期转换为（根据 GMT）字符串
    ctx.status = 304;
    return; // 不返回任何的内容
  }

  console.log("【cache-control】不缓存的时候会打印");
  ctx.set("last-modified", resource.mtime.toGMTString());
  ctx.body = resource;
});

// 协商缓存，内容变化，原理一样根据文件内容 hash 作为标识
Router.get("/etag", async (ctx) => {});

app
  .use(Router.routes()) //启动路由
  .use(Router.allowedMethods());
app.listen(3000);
