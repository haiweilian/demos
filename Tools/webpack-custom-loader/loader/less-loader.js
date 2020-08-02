const less = require("less");

// 调用 less 的编译器，编译 less -> css。
// https://github.com/less/less.js
module.exports = function (source) {
  less.render(source, (error, output) => {
    this.callback(error, output.css);
  });
};
