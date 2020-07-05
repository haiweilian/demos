const { promisify } = require("util");

// 下载 github 上的源码
module.exports.clone = async (repo, desc) => {
  const download = promisify(require("download-git-repo"));
  const ora = require("ora");
  const process = ora(`下载......${repo}`);
  process.start();
  await download(repo, desc);
  process.succeed();
};
