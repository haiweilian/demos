function Person() {
  this.name = "lian";
}

let person = new Person();

// 声明之后，函数就有了一个与之关联的原型对象。
console.log(Person.prototype);

// 如前所述：构造函数有一个 prototype 属性；
// 引用其原型对象，而这个原型对象也有一个 constructor 属性，引用这个构造函数，
// 换句话说，两者项目引用
console.log(Person.prototype.constructor === Person); // true

// 实例通过 __proto__ 链接到原型对象
// 实例与构造函数没有直接联系，与原型对象有直接联系
console.log(person.__proto__ === Person.prototype); // true
console.log(person.__proto__.constructor === Person.prototype.constructor); // true
