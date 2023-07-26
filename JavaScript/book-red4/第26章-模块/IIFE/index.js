let Foo = (function () {
  // 私有 Foo 模块的代码
  var bar = "bar...";
  return {
    bar,
  };
})();

console.log(Foo.bar); // bar...
