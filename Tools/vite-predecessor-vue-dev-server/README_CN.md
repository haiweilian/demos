# 这是什么

[尤雨溪几年前开发的“玩具 vite”，才 100 多行代码，却十分有助于理解 vite 原理](https://juejin.cn/post/7021306258057592862)

## 实现原理

- 浏览器请求导入作为原生 ES 模块导入 - 没有捆绑。

- 服务器拦截对 \*.vue 文件的请求，即时编译它们，然后将它们作为 JavaScript 发回。

- 对于提供在浏览器中工作的 ES 模块构建的库，只需直接从 CDN 导入它们。

- 导入到 .js 文件中的 npm 包（仅包名称）会即时重写以指向本地安装的文件。 目前，仅支持 vue 作为特例。 其他包可能需要进行转换才能作为本地浏览器目标 ES 模块公开。

## 主要实现

使用 `express` 搭建一个服务，在中间件里对每个请求处理，下面简写代码  先不考虑缓存。

```js
// 当发起一个请求时，
const vueMiddleware = (options = defaultOptions) => {
  // vue 的编译器模块
  const compiler = vueCompiler.createDefaultCompiler();

  // 返回响应
  function send(res, source, mime) {
    res.setHeader("Content-Type", mime);
    res.end(source);
  }

  // vue SFC 编译
  async function bundleSFC(req) {
    const { filepath, source, updateTime } = await readSource(req);
    const descriptorResult = compiler.compileToDescriptor(filepath, source);
    const assembledResult = vueCompiler.assemble(compiler, filepath, {
      ...descriptorResult,
      script: injectSourceMapToScript(descriptorResult.script),
      styles: injectSourceMapsToStyles(descriptorResult.styles)
    });
    return { ...assembledResult, updateTime };
  }

  return async (req, res, next) => {
    if (req.path.endsWith(".vue")) {
      // 当 vue 结尾，调用 vue 编译器之后再返回
      const result = await bundleSFC(req);
      send(res, result.code, "application/javascript");
    } else if (req.path.endsWith(".js")) {
      // 当前 js 结尾，这里指 main.js 入口
      // 读取文件内容并转换 import 语句，最后在加入缓存
      const result = await readSource(req);
      out = transformModuleImports(result.source);
      send(res, out, "application/javascript");
    } else if (req.path.startsWith("/__modules/")) {
      // 当是 __modules 开头的时候，证明是 npm 包，从 node_modules 读取，在返回文件
      const pkg = req.path.replace(/^\/__modules\//, "");
      out = (await loadPkg(pkg)).toString();
      send(res, out, "application/javascript");
    } else {
      next();
    }
  };
};
```
