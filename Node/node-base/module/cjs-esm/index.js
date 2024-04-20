// cjs 加载 esm 模块： 必须使用 import()
// 由于 package.json 的 type 字段为 commonjs，所以需要 .mjs 后缀来指定 esm 模块
(async () => {
  const add = await import("./add.mjs");
  console.log(add.default(1, 2));
})();
