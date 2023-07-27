const minimist = require("minimist");

console.log(process.argv);

// 每个参数名称之前使用双破折号 --force --xxxx 才能解析成对象
console.log(minimist(process.argv));
