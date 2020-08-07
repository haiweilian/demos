// webpack的功能扩展。
// 注册事件，webpack在编译构建的时候，会经历很多的（生命周期，hook,事件）机制。

const webpack = require("webpack");
const webpackConfig = require("../webpack.config");

const compiler = webpack(webpackConfig);

Object.keys(compiler.hooks).forEach((name) => {
  compiler.hooks[name].tap("test-plugin-api", () => {
    console.log(`run -> ${name}`);
  });
});

compiler.run();
