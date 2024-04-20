https://nodejs.cn/api/v18/module.html
https://juejin.cn/book/7196627546253819916/section/7197301563075854347

### node 确定模块系统

Node.js 会将以下内容视为 ES 模块：

> 扩展名为 .mjs 的文件。
> 当最近的父 package.json 文件包含值为 "module" 的顶层 "type" 字段时，扩展名为 .js 的文件。
> 字符串作为参数传入 --eval，或通过 STDIN 管道传输到 node，带有标志 --input-type=module。

Node.js 会将以下内容视为 CommonJS：

> 扩展名为 .cjs 的文件。
> 当最近的父 package.json 文件包含值为 "commonjs" 的顶层字段 "type" 时，则扩展名为 .js 的文件。
> 字符串作为参数传入 --eval 或 --print，或通过 STDIN 管道传输到 node，带有标志 --input-type=commonjs。
