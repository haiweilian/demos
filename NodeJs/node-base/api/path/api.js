// 路径操作相关
import path from "path";

console.log(path.delimiter);

console.log(path.extname("xxx.html"));

console.log(path.join("a", "/b/c", "../d"));
console.log(path.resolve("a", "/b/c", "../d"));
