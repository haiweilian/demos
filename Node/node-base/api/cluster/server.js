import cluster from "cluster";
import http from "http";
import { cpus } from "os";
import process from "process";

const numCPUs = cpus().length;

//  16 以上用 isPrimary 以下用 isMaster
if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    // 开启子进程，复制当前的进程
    cluster.fork();
  }
} else {
  http
    .createServer(() => {
      console.log("111");
    })
    .listen(3000);

  console.log(`Worker ${process.pid} started`);
}
