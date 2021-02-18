// _函数节流：如果短时间内大量触发同一事件，那么在函数执行一次之后，该函数在指定的时间期限内不再工作，直至过了这段时间才重新生效_
function throttle(fn, delay) {
  let timer = null;

  return function () {
    let arg = arguments;

    // 如果上次执行的时间间隔未到，不执行下一次。
    if (timer) {
      return;
    }

    timer = setTimeout(function () {
      fn.apply(this, arg);
      clearTimeout(timer);
      timer = null;
    }, delay);
  };
}

let count = 0;
let handerCount = function () {
  count++;
};

// 代理原始函数
let throttleCount = throttle(handerCount, 500);

// 开始频繁操作，间隔 500ms 数字才会变
let timer = setInterval(() => {
  throttleCount();
  console.log(count);
}, 100);
