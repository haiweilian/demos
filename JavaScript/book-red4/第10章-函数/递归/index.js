function factorial(num) {
  if (num <= 1) {
    return 1;
  } else {
    return num * factorial(num - 1);
  }
}

// 可以使用 `arguments.callee` 指向正在执行的函数的指针。
function factorial(num) {
  if (num <= 1) {
    return 1;
  } else {
    return num * arguments.callee(num - 1);
  }
}

// 但是 `arguments.callee` 在严格模式下不能使用，此时可以使用命名函数表达式达到目的。
factorial = function f(num) {
  if (num <= 1) {
    return 1;
  } else {
    return num * f(num - 1);
  }
};

console.log(factorial(2));

let otherFactorial = factorial;
factorial = null;
otherFactorial(2); // TypeError: factorial is not a function
