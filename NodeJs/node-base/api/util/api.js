import util from "util";
import fs from "fs";
// 大部分都可以被外部库实现

// 普通函数 Promise 化
let readFile = util.promisify(fs.readFile);

readFile("./api.js").then((res) => {
  console.log(res.toString());
});
