function SuperType() {
  this.superProperty = true;
}
SuperType.prototype.getSuperValue = function () {
  return this.superProperty;
};

function SubType() {
  this.subProperty = false;
}

// SubType 的原型被赋值为 SuperType 的实例。
SubType.prototype = new SuperType();
SubType.prototype.getSubValue = function () {
  return this.subProperty;
};

let instance = new SubType();

// __proto__ 指向 instance 的原型，而原型被赋值为 ”SuperType 实例“。
console.log(instance.__proto__);
// 继续往下 __proto__ 指向 ”SuperType 实例“ 的原型。
console.log(instance.__proto__.__proto__);
// 继续往下 原型的 "constructor" 指向构造函数
console.log(instance.__proto__.__proto__.constructor === SuperType); // true

// 在这条链上可以找到 getSubValue 和 getSuperValue 方法。
console.log(instance.getSubValue()); // false
console.log(instance.getSuperValue()); // true
