const http = require("http");

const server = http.createServer((req, res) => {
  // 随机抛出出错
  if (Math.random() > 0.5) {
    error();
  } else {
    res.end("hello");
  }
});

// 如果模块被引用，则导出服务
if (module.parent) {
  module.exports = server;
} else {
  server.listen(3000);
}
