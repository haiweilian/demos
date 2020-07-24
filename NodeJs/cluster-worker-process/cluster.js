const cluster = require("cluster");
const process = require("process");
const os = require("os");
const numCPUs = os.cpus().length;

// 存储所有进程
let workers = {};
if (cluster.isMaster) {
  // 监听退出事件
  cluster.on("exit", (worker, code, signal) => {
    let pid = worker.process.pid;
    console.log("工作进程 %d 关闭 (%s). 重启中...", pid);
    // 删除进程，并启动一个新的进程
    delete workers[pid];
    worker = cluster.fork();
    workers[pid] = worker;
  });

  // 根据 cpu 个数 开启同等进程
  console.log("numCPUs:", numCPUs);
  for (let i = 0; i < numCPUs; i++) {
    let worker = cluster.fork();
    let pid = worker.process.pid;
    console.log("init ... pid", pid);
    workers[pid] = worker;
  }
} else {
  let app = require("./app");
  // 为什么监听多个相同端口，不会报错？ https://www.sohu.com/a/247732550_796914
  app.listen(3000);
}

// 当主进程被终止时，关闭所有工作进程
process.on("SIGTERM", () => {
  for (let pid in workers) {
    process.kill(pid);
  }
  process.exit(0);
});
