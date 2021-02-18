// 实现方案：
// 1、bind 返回一个函数，对于函数来说有两种方式调用，一种是直接调用，一种是通过 new 的方式。
Function.prototype.myBind = function (context) {
  // 1、判断是不是函数调用。
  if (typeof this !== "function") {
    throw new TypeError(this);
  }

  // 2、保存 this 和截取剩余参数
  const _this = this;
  const args = [...arguments].slice(1);

  // 返回一个函数
  return function F() {
    // 因为返回一个函数，可以使用 new F()，所以需要判断。
    if (this instanceof F) {
      // 通过 new 的方式 this 就是当前实例
      return new _this(...args, ...arguments);
    } else {
      // 直接调用的方式 this 是 context
      return _this.apply(context, args.concat(...arguments));
    }
  };
};

// ============================== 测试 ==============================
function bindText(msg) {
  console.log(msg, this.val);
}

bindText("bindText");
bindText.bind({ val: 1 }, "bindText")();
bindText.myBind({ val: 2 }, "bindText")();

let np = bindText.bind({ val: 1 }, "bindText");
let np1 = bindText.myBind({ val: 2 }, "bindText");
new np();
new np1();
