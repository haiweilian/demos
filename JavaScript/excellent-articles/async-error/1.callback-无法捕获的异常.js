function fetch(callback) {
  setTimeout(() => {
    throw Error("请求失败");
  });
}

try {
  fetch(() => {
    console.log(".........."); // 不会执行
  });
} catch (error) {
  console.log(".........."); // 不会执行
}

// 异常，无法捕获宏任务中的异步的错误。
