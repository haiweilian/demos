export {};

// 类装饰器
@classDecor
class Example {
  // 属性装饰器
  @attributeDecor
  attribute: string;

  // 访问器装饰器
  @accessorDecor
  get accessor(): string {
    return this.attribute;
  }

  // 方法装饰器
  @functionDecor
  // 参数装饰器
  func(@paramsDecor params: number): number {
    return params;
  }
}

function classDecor(constructor: Function) {
  //constructor类的构造函数
  console.log("classDecor is called");
}

function functionDecor(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  // target对于静态成员来说是类的构造函数，对于实例成员是类的原型对象
  // propertyKey成员的名字
  // descriptor成员的属性描述符
  console.log("functionDecor is called");
}

function accessorDecor(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  // target对于静态成员来说是类的构造函数，对于实例成员是类的原型对象
  // propertyKey成员的名字
  // descriptor成员的属性描述符
  console.log("accessorDecor is called");
}

function attributeDecor(target: any, propertyKey: string) {
  // target对于静态成员来说是类的构造函数，对于实例成员是类的原型对象
  // propertyKey成员的名字
  console.log("attributeDecor is called");
}

function paramsDecor(target: Object, propertyKey: string | symbol, parameterIndex: number) {
  // target对于静态成员来说是类的构造函数，对于实例成员是类的原型对象
  // propertyKey成员的名字
  // parameterIndex参数在函数参数列表中的索引
  console.log("paramsDecor is called");
}

console.log("new Example instance");
new Example();

// attributeDecor is called
// accessorDecor is called
// paramsDecor is called
// functionDecor is called
// classDecor is called
// new Example instance
