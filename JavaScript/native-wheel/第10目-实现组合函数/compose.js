// 实现方案：
// 如果一个值要经过多个函数，才能变成另外一个值，就可以把所有中间步骤合并成一个函数，这叫做"函数的合成"（compose）。
// 合成的好处显而易见，它让代码变得简单而富有可读性，同时通过不同的组合方式，我们可以轻易组合出其他常用函数，让我们的代码更具表现力。

function f1(arg) {
  console.log("f1", arg);
  return arg + "f1";
}

function f2(arg) {
  console.log("f2", arg);
  return arg + "f2";
}

function f3(arg) {
  console.log("f3", arg);
  return arg + "f3";
}

function f4(arg) {
  console.log("f4", arg);
  return arg + "f4";
}

function compose(...funcs) {
  // 没有传入函数参数，就返回一个默认函数（直接返回参数）
  if (funcs.length === 0) {
    return (arg) => arg;
  }
  // 单元素数组时调用 reduce，会直接返回该元素，不会执行callback; 所以这里手动执行
  if (funcs.length === 1) {
    return funcs[0];
  }
  // 依次拼凑执行函数
  // reduce回调函数第一次执行时，返回值为 函数 (...args) => f4(f3(...args))，作为下一次执行的a参数
  // 回调函数第二次执行时，返回值为 函数(...args) => f4(f3(f2(...args))),作为下一次执行的a参数
  // 回调函数第三次执行时，返回值为 函数(...args) => f4(f3(f2(f1(...args))))
  return funcs.reduce((a, b) => (...args) => a(b(...args)));
}

let res = compose(f4, f3, f2, f1)("omg"); //f4(f3(f2(f1("omg"))));

console.log(res); // omgf1f2f3f4
