const chalk = require("chalk");
const progress = require("progress");

console.log(chalk.blue("ha ha"));

const bar = new progress(":bar", { total: 50 });

const timer = setInterval(() => {
  bar.tick();
  if (bar.complete) {
    clearInterval(timer);
  }
}, 100);
