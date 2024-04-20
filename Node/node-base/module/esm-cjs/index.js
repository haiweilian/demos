// esm 加载 cjs 模块：可以直接加载
// 由于 package.json 的 type 字段为 module，所以需要 .cjs 后缀来指定 cjs 模块
import add from "./add.cjs";
import subtract from './module/subtract.js';

console.log(add(1, 2));
console.log(subtract(1, 2));
