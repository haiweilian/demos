// - loader 本质上就是一个函数，但是不可以是箭头函数，因为需要用到 this。
// - 拿到原内容，做进一步的加工处理，处理后把加工后的内容返回。
// - 如何接受配置。
// - 如何返回多个值。
// - 如果有异步的事情要怎么处理。
// - 多个 loader 的使用。

module.exports = function (source) {
  const callback = this.async();
  console.log("...同步执行完成");
  setTimeout(() => {
    console.log("...异步执行完成", this.query.name);
    callback(null, source);
  }, 2000);
};
