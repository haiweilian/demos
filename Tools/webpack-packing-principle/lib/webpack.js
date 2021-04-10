const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const { transformFromAst } = require("@babel/core");

module.exports = class Webpack {
  constructor(options) {
    this.entry = options.entry;
    this.output = options.output;
    this.modules = [];
  }

  /**
   * 启动编译
   */
  run() {
    const info = this.parse(this.entry);
    this.modules.push(info);

    // 递归处理所有依赖
    for (let i = 0; i < this.modules.length; i++) {
      const item = this.modules[i];
      const { yilai } = item;
      if (yilai) {
        for (let j in yilai) {
          this.modules.push(this.parse(yilai[j]));
        }
      }
    }

    //格式转换
    const obj = {};
    this.modules.forEach((item) => {
      obj[item.entryFile] = {
        yilai: item.yilai,
        code: item.code,
      };
    });
    this.file(obj);
  }

  /**
   * 内容解析
   */
  parse(entryFile) {
    const content = fs.readFileSync(entryFile, "utf-8");
    // 解析成 ast
    const ast = parser.parse(content, {
      sourceType: "module",
    });
    console.log(ast);

    // 获取依赖
    const yilai = {};
    traverse(ast, {
      ImportDeclaration({ node }) {
        // 获取文件所在的目录路径
        const newPathName = "./" + path.join(path.dirname(entryFile), node.source.value);
        yilai[node.source.value] = newPathName;
      },
    });
    console.log(yilai);

    // 转换语法
    const { code } = transformFromAst(ast, null, {
      presets: ["@babel/preset-env"],
    });

    console.log(code);

    return {
      entryFile,
      yilai,
      code,
    };
  }

  /**
   * 生成文件
   */
  file(code) {
    const filePath = path.join(this.output.path, this.output.filename);
    const newCode = JSON.stringify(code, null, 2);
    const bundle = `(function(graph){
      function require(module){
          // 处理依赖默认 如 ./a.js 对应的 应该是 ./src/a.js
          function pathRequire(realtivePath){
            return require(graph[module].yilai[realtivePath])
          }
          var exports = {};
          (function(require,exports,code){
            eval(code)
          })(pathRequire,exports,graph[module].code)
        return exports;
      }
      // 默认加载入口文件
      require('${this.entry}')
    })(${newCode})`;
    fs.writeFileSync(filePath, bundle, "utf-8");
  }
};
