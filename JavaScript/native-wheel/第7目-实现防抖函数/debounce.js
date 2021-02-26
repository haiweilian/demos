// 实现方案：
// _函数防抖：如果短时间内大量触发同一事件，只会执行一次函数。_
// 1、返回一个内部函数。
// 2、每次调用内部函数都清除上次的定时器让上次未执行的函数清除掉。
function debounce(fn, delay) {
  let timer = null;

  return function () {
    let arg = arguments;

    // 每次操作时，清除上传的定时器
    clearTimeout(timer);
    timer = null;

    // 定义新的定时器，一段时间后进行操作
    timer = setTimeout(function () {
      fn.apply(this, arg);
    }, delay);
  };
}

let count = 0;
let handerCount = function () {
  count++;
};

// 代理原始函数
let debounceCount = debounce(handerCount, 500);

// 开始频繁操作，数字不会变
let timer = setInterval(() => {
  debounceCount();
  console.log(count);
}, 100);

// 停止频繁操作，500ms 后数字变化
setTimeout(() => {
  clearInterval(timer);
  setTimeout(() => {
    console.log(count);
  }, 500);
}, 2000);
