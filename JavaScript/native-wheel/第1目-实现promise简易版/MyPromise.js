// 实现方案：初始化、收集回调，执行回调。
// 定义 Promise 的三种状态
const PENDING = "pending";
const RESOLVED = "resolved";
const REJECTED = "rejected";

class MyPromise {
  constructor(resolver) {
    // 当前的状态默认 pending
    this.state = PENDING;
    // value 变量用于保存 resolve 或者 reject 中传入的值
    this.value = undefined;
    // 用于保存 then 和 catch 中的回调
    this.resolvedCallbacks = [];
    this.rejectedCallbacks = [];
    // 执行 resolver 函数，接收 resolve 和 reject 参数
    resolver(this.resolve.bind(this), this.reject.bind(this));
  }

  // 1、首先必须是 pending 状态，并将状态更改为对应的状态
  // 2、将传入的值赋值给 value
  // 3、执行对应的回调数组
  // Promise 的 resolve 参数
  resolve(value) {
    setTimeout(() => {
      if (this.state === PENDING) {
        this.state = RESOLVED;
        this.value = value;
        this.resolvedCallbacks.map((cb) => cb(value));
      }
    });
  }

  // Promise 的 reject 参数
  reject(value) {
    setTimeout(() => {
      if (this.state === PENDING) {
        this.state = REJECTED;
        this.value = value;
        this.rejectedCallbacks.map((cb) => cb(value));
      }
    });
  }

  // 首先判断两个参数是否为函数类型，因为这两个参数是可选参数
  then(onFulfilled, onRejected) {
    // 不传时候的默认函数
    onFulfilled = typeof onFulfilled === "function" ? onFulfilled : (v) => v;
    onRejected = typeof onRejected === "function" ? onRejected : (v) => v;
    // 保存回调函数
    if (this.state === PENDING) {
      this.resolvedCallbacks.push(onFulfilled);
      this.rejectedCallbacks.push(onRejected);
    }
    return this;
  }

  catch(onRejected) {
    return this.then(undefined, onRejected);
  }
}

// ============================== 测试 ==============================
// === 原生
let p = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(1);
  }, 1000);
});

p.then((result) => {
  console.log(result);
}).catch((error) => {
  console.log(error);
});

// === 实现
let p1 = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(2);
  }, 1000);
});

p1.then((result) => {
  console.log(result);
}).catch((error) => {
  console.log(error);
});
