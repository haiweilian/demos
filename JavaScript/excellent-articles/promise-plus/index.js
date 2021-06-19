// https://github.com/xieranmaya/blog/issues/3

function MyPromise(executor) {
  var self = this;
  self.status = "pending"; // 状态
  self.data = undefined; // 值
  self.onResolvedCallback = []; // 成功回调
  self.onRejectedCallback = []; // 失败回调

  // 执行相应的回调函数
  function resolve(value) {
    setTimeout(function () {
      if (self.status === "pending") {
        self.status = "resolved";
        self.data = value;
        for (var i = 0; i < self.onResolvedCallback.length; i++) {
          self.onResolvedCallback[i](value);
        }
      }
    });
  }

  // 执行相应的回调函数
  function reject(error) {
    setTimeout(function () {
      if (self.status === "pending") {
        self.status = "rejected";
        self.data = error;
        for (var i = 0; i < self.onRejectedCallback.length; i++) {
          self.onRejectedCallback[i](error);
        }
      }
    });
  }

  try {
    // 执行 executor 可能出错
    executor(resolve, reject);
  } catch (error) {
    reject(error);
  }
}

// 接收两个参数 onResolved, onRejected
// then 可以多次调用
MyPromise.prototype.then = function (onResolved, onRejected) {
  var self = this;
  var promise2;

  // 如果 then 的参数不是函数，许要忽略
  // function (v) { return v} 值穿透问题，把值一直往后抛。
  onResolved = typeof onResolved === "function" ? onResolved : function (v) { return v };
  onRejected = typeof onRejected === "function" ? onRejected : function (r) { return r };

  if (self.status === "resolved") {
    // Promise的 then 方法返回一个新的 Promise
    return promise2 = new MyPromise(function (resolve, reject) {
      try {
        var x = onResolved(self.data);
        // 如果onResolved的返回值是一个Promise对象，直接取它的结果做为promise2的结果
        if (x instanceof MyPromise) {
          x.then(resolve, reject);
        } else {
          // 如果不是直接把值传到下一个
          resolve(x);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  if (self.status === "rejected") {
    // Promise的 then 方法返回一个新的 Promise
    return promise2 = new MyPromise(function (resolve, reject) {
      try {
        var x = onResolved(self.data);
        if (x instanceof MyPromise) {
          return x.then(resolve, reject);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  if (self.status === "pending") {
    // Promise的 then 方法返回一个新的 Promise
    // pending 状态无法确定成功还是失败，先添加进回调函数里
    return promise2 = new MyPromise(function (resolve, reject) {
      self.onResolvedCallback.push(function (value) {
        try {
          var x = onResolved(self.data);
           // 如果onResolved的返回值是一个Promise对象，直接取它的结果做为promise2的结果
          if (x instanceof MyPromise) {
            x.then(resolve, reject);
          } else {
            // 如果不是直接把值传到下一个
            resolve(x);
          }
        } catch (e) {
          reject(e);
        }
      });

      self.onRejectedCallback.push(function (reason) {
        try {
          var x = onRejected(self.data);
          if (x instanceof MyPromise) {
            x.then(resolve, reject);
          }
        } catch (e) {
          reject(e);
        }
      });
    });
  }
};

MyPromise.prototype.catch = function (onRejected) {
  return this.then(null, onRejected);
};
