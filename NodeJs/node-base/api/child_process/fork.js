import { fork } from "child_process";

// 创建一个子进程，在子进程中执行文件
let f = fork("hello.js", ["--xxx"]);

f.on("message", () => {});

f.send("xxx");

process.on("message", () => {});
