import { exec, execFile } from "child_process";

// 衍生 shell，然后在该 shell 中执行 command
// exec(xx) 相当于直接在总端执行命令
exec("ls", function (error, stdout, stderr) {
  console.log(stdout);
});

exec("sh hello.sh", function (error, stdout, stderr) {
  console.log(stdout);
});

exec("node hello.js --xxx", function (error, stdout, stderr) {
  console.log(stdout);
});

// exec 和 execFile 之间区别的重要性可能因平台而异
// 不要在 windows 上使用它，所以就用的少了现在程序不都是跨平台吗。
execFile("ls", function (error, stdout, stderr) {
  console.log(stdout);
});

execFile("sh", ["hello.sh"], function (error, stdout, stderr) {
  console.log(stdout);
});

execFile("node", ["hello.js"], function (error, stdout, stderr) {
  console.log(stdout);
});
