// 实现方案：
// 1、不传入第一个参数，那么上下文默认为 window
// 2、改变 this 指向，让新的对象可以执行该函数，并能接受参数
// 3、重点就是：让函数被 context 调用。
Function.prototype.myCall = function (context) {
  // 1、判断是不是函数调用。
  if (typeof this !== "function") {
    throw new TypeError(this);
  }

  // 2、context 为可选参数，默认不传为 window。
  context = context || window;

  // 3、给 context 添加一个属性，值为需要调用的函数。
  context.fn = this;

  // 4、获取剩余的参数
  const args = [...arguments].slice(1);

  // 5、调用函数并返回结果，此时 fn 的调用者是 context，所以重新绑定了 this
  const result = context.fn(...args);

  // 6、删除函数
  delete context.fn;

  return result;
};

// ============================== 测试 ==============================
function callText(msg) {
  console.log(msg, this.val);
}

callText("callText");
callText.call({ val: 1 }, "callText");
callText.myCall({ val: 2 }, "callText");
