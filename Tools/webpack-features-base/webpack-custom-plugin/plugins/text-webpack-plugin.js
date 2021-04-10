class textWebpackPlugin {
  constructor(prop) {
    this.name = prop.name;
  }
  // apply函数钩入webpack的hook。
  apply(compiler) {
    // 创建编译之后，输出插件的配置。
    compiler.hooks.compile.tap("textWebpackPlugin", (compilation) => {
      console.log(`name -> ${this.name}`);
    });
    // 生成资源到 output 目录之前，忘静态资源里追加一个文件。
    compiler.hooks.emit.tapAsync("textWebpackPlugin", (compilation, cb) => {
      compilation.assets["text.txt"] = {
        source: () => "textWebpackPlugin",
        size: () => 1024,
      };
      // 异步钩子必须最后调用回调。
      cb();
    });
  }
}

module.exports = textWebpackPlugin;
