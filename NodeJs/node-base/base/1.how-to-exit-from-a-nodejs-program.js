const http = require("http");

http.createServer().listen(3000, () => {
  console.log("启动成功");
});

// process.on("SIGKILL", () => {
//   console.log("SIGKILL");
// });

process.on("SIGTERM", () => {
  console.log("SIGTERM");
  process.exit(0);
});

process.on("exit", () => {
  console.log("exit");
});

setTimeout(() => {
  process.kill(process.pid, "SIGTERM");
}, 2000);
