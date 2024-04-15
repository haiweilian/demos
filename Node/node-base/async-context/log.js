// 这些类用于关联状态并在整个回调和 promise 链中传播它。它们允许在 Web 请求的整个生命周期或任何其他异步持续时间内存储数据。它类似于其他语言中的线程本地存储。
const http = require("http");
const { AsyncLocalStorage, AsyncResource } = require("async_hooks");

const asyncLocalStorage = new AsyncLocalStorage();

let id = 0;

function logWithId(msg) {
  const store = asyncLocalStorage.getStore();
  // console.log(store);
  console.log(`${store !== undefined ? store.id : "-"}:`, msg);
}

http
  .createServer((req, res) => {
    asyncLocalStorage.run(
      {
        req,
        res,
        id: id++,
      },
      () => {
        logWithId("start");
        // 这里可以是任何的异步操作
        setTimeout(() => {
          logWithId("finish");
          res.end();
        }, 1000);
      }
    );
  })
  .listen(3000);
