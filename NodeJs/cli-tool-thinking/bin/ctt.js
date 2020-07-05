#! /usr/bin/env node

// 1. `#! /usr/bin/env node` 指定脚本解释器为 node
// 2. `ctt: ./bin/ctt.js` 在 package.json 里面加入 bin
// 3. `npm link` 将 npm 模块链接到对应的运行项目中去

// 定制命令行界面 `ctt`
const program = require("commander");

program.version(require("../package.json").version);

program
  .command("init <name>")
  .description("init project")
  .action(require("../lib/init"));

program.parse(process.argv);
