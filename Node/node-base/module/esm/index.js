// vm 内置的模块解析
import add from "./add.js"; // 必须带上后缀名

console.log(add(1, 2));

// esm 没有 cjs 中的全局变量，可以模拟
const __filename = new URL(import.meta.url).pathname;
console.log(__filename)

const __dirname = new URL(".", import.meta.url).pathname;
console.log(__dirname)
