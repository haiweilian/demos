import { spawn } from "child_process";

// 运行命令，buffer 流的方式
let ls = spawn("ls");

ls.stdout.on("data", (data) => {
  // buffer
  console.log(data.toString());
});
