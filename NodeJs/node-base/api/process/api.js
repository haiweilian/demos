import process from "process";

// 当前进程相关的信息
process.title = "node process api";

process.argv;

process.env;

process.exit;

process.nextTick(() => {});

process.pid;

process.platform;

// stdin：标准输入流  （终端键盘输入）
process.stdin.on("data", (data) => {
  console.log("😝" + data);
});

// stdout： 标准输出流 （终端显示）
// process.stdout.on("data", (data) => {
//   console.log("😢" + data);
// });
