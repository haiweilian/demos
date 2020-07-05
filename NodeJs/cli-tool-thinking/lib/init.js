const { promisify } = require("util");
const figlet = promisify(require("figlet"));
const clear = require("clear");
const chalk = require("chalk");
const { clone } = require("./download");

const log = (content) => console.log(chalk.green(content));

const spawn = async (...args) => {
  const { spawn } = require("child_process");
  const options = args[args.length - 1];
  // windows 兼容性问题
  if (process.platform === "win32") {
    // 设置 shell 选项为 true 以隐式地调用 cmd
    options.shell = true;
  }

  // 将子进程的输出流到主进程
  return new Promise((resolve) => {
    const proc = spawn(...args);
    proc.stdout.pipe(process.stdout);
    proc.stderr.pipe(process.stderr);
    proc.on("close", () => {
      resolve();
    });
  });
};

module.exports = async (name) => {
  // 清屏 `clear`
  clear();

  // 打印欢迎页面
  const welcome = await figlet("CTT Welcome");
  log(welcome);

  // 创建项目 克隆代码
  log(`🚀创建项目:` + name);
  await clone("github:su37josephxia/vue-template", name);

  // 安装依赖
  log("🚀安装依赖");
  await spawn("npm", ["install"], { cwd: `./${name}` });

  // 安装完成
  log(`
👌安装完成：
To get Start:
===========================
    cd ${name}
    npm run serve
===========================`);

  // 打开浏览器
  require("open")("http://localhost:8080");

  // 运行服务
  await spawn("npm", ["run", "serve"], { cwd: `./${name}` });
};
