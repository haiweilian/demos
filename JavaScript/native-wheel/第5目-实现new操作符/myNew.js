// 实现方案：
// 1、生成一个对象
// 2、链接到原型
// 3、绑定 this
// 4、返回新对象
function create() {
  let obj = {};
  let Con = [].shift.call(arguments);
  // 这个新对象内部的 [[Prototype]](__proto__) 特性被赋值为构造函数的 prototype 属性。
  obj.__proto__ = Con.prototype;
  // 绑定 this
  let result = Con.apply(obj, arguments);
  // 如果构造函数返回非空对象，则返回改对象；否则：返回刚创建的对象
  return result instanceof Object ? result : obj;
}

// ============================== 测试 ==============================
function newText() {
  this.a = 1;
}

let n1 = new newText();
console.log(n1.a);

let n2 = create(newText);
console.log(n2.a);
