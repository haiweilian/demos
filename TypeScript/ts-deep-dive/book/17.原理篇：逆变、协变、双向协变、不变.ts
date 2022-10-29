export {};

/**
 * @子类型
 * ts 怎么确定的 [父类型] 和 [子类型]
 */
interface Person {
  name: string;
  age: number;
}

interface Lian {
  name: string;
  age: number;
  location: string;
}

// * 1. 在 ts 中确定是否为父子关系靠的是结构。列如 Person 和 Lian 并没有通过 extends 继承，但它们对比结构可以确定父子关系。
type test1 = Lian extends Person ? true : false; // Lian 是 Person 的子类型

// * 2. 在 ts 中两个父子类型之间 **更具体** 的是子类型(注意是更具体，而不是更多)。
type test2 = "a" extends "a" | "b" ? true : false; // "a" 是 "a" | "b" 的子类型

// * 3. 两个结构不同的类型没有父子关系也不可变
type test3 = "a" extends Person ? true : false; // 结构完全不同，没有父子关系也叫不变。

/**
 * @协变covariant
 * 子类型可以赋值给父类型的情况就叫做协变
 */
let person: Person = {
  name: "no",
  age: 0,
};

let lian: Lian = {
  name: "lian",
  age: 20,
  location: "北京",
};

// 可以，因为满足 person 的所有属性，所以类型是安全的
person = lian;

// 不可以，因为会缺少 location 属性，所以类型是不安全的
lian = person;

/**
 * @逆变covariant
 * 父类型可以赋值给子类型的情况就叫做逆变
 */
let printName = (person: Person) => {
  console.log(person.name);
};

let printLocation = (lian: Lian) => {
  console.log(lian.location);
};

// 可以，因为在调用的时候传入的子类，满足传入父类函数的属性访问。所以类型是安全的
printLocation(lian);
printLocation = printName;

// 不可以，因为在调用的时候传入的父类，不能满足传入子类函数的属性访问，所以类型是不安全的
printName(person);
printName = printLocation;

// 看一个之前的工具类：提取函数返回值类型
// 因为函数参数逆变的性质，所以 (...arg: unknown[]) 的类型得是函数参数的父类，unknown 显然不是。所以这里必须用 any
// type GetReturnType<Fun extends Function> = Fun extends (...arg: unknown[]) => infer R
//   ? R
//   : never;
type GetReturnType<Fun extends Function> = Fun extends (...arg: any[]) => infer R
  ? R
  : never;
type GetReturnTypeRes = GetReturnType<(x: number) => 1>;

/**
 * @双向协变
 * 双向协变 在 ts2.x 函数时是默认支持双向协变的，但这个类型不安全。所以现在需要在 tsconfig.json 设置 strictFunctionTypes = false
 */
printLocation = printName;
printName = printLocation;
