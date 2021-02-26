// 实现方案：
// 柯里化是把接受多个参数的函数变换成接受一个单一参数（最初函数的第一个参数）的函数，并且返回接受余下的参数而且返回结果的新函数的技术。
// 所谓"柯里化"，就是把一个多参数的函数，转化为单参数函数。

// === 柯里化之前
function add(x, y) {
  return x + y;
}

console.log(add(1, 2)); // 3

// === 柯里化之后
function addX(y) {
  return function (x) {
    return x + y;
  };
}

console.log(addX(2)(1)); // 3
