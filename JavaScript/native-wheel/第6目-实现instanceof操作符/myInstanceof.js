// 实现方案：
// instanceof 可以正确的判断对象的类型，因为内部机制是通过判断对象的原型链中是不是能找到类型的 prototype
// 1、获取类型（实例）的原型 和 对象的原型
// 2、然后一直循环判断对象的原型是否等于类型的原型，直到类型原型为 null 或相等结束。
function myInstanceof(left, right) {
  let prototype = right.prototype;
  left.__proto__;
  while (true) {
    if (left === null || left === undefined) {
      return false;
    } else if (left === prototype) {
      return true;
    } else {
      left = left.__proto__;
    }
  }
}

let n = new Number(1);

console.log(n instanceof Number);
console.log(myInstanceof(n, Number));
console.log(n instanceof Boolean);
console.log(myInstanceof(n, Boolean));
