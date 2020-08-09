# webpack 打包原理

## 核心

- 接收一份配置(webpack.config.js)
- 分析出入口模块位置 (webpack 是自己写的解析器, 这里借助 babel 解析是一样的。)
  - 读取入口模块的内容，分析内容哪些是依赖
  - 哪些是源码
  - es6 需要编译
- 拿到对象数据结构
  - 模块路径
  - 处理好的内容
- 创建 bundle
  - 启动器函数，来补充代码里有可能出现的 module exports require，让浏览器能够顺利的执行

## 编译

```sh
// webpack 编译
npm run webpack
```

```sh
// 自己实现的 webpack 编译
npm run webpack:my
```

```sh
// 测试
node dist/main.js
```
