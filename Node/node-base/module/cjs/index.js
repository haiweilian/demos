// nodejs 自己实现的模块解析
const add = require("./add");

console.log(add(1, 2));

// 默认的全局对象
console.log(__dirname)
console.log(__filename)
console.log(module)
