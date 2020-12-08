const express = require("express");
const app = express();
const WebSocketServer = require("ws").Server;

// 创建 Socket 服务
const wss = new WebSocketServer({ port: 4000 });
wss.on("connection", function (ws) {
  ws.on("message", function (message) {
    // 接受到消息，直接返回。
    ws.send(message);
  });
});

app.use(express.static(__dirname + "/public"));
app.listen(3000, function () {
  console.log("listen at 3000");
});
