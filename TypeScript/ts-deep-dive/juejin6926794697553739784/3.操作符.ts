/**
 * @键值获取 keyof
 */
// 获取类型的所有键值
type Person = {
  name: string;
  age: number;
};

// 类型 = keyof 类型
type PersonKey = keyof Person;

// 用来约束对象的访问
let PersonObj: Person = { name: "l", age: 1 };
function getValue(p: Person, k: keyof Person) {
  return p[k];
}
function getValue1<T, U extends keyof T>(p: T, k: U) {
  return p[k];
}

getValue(PersonObj, "name");
getValue1(PersonObj, "name");

/**
 * @实例类型获取 typeof
 */
let me: Person = { name: "l", age: 1 };

// 类型 = keyof 实例对象
type Met = typeof me;

let you: Met = { name: "l", age: 1 };

type MetKey = keyof typeof me;

/**
 * @遍历属性 in
 */
type TypeToNumber<T> = {
  // keyof 获取所有的键，in 循环，重新定义为 number 类型
  // [自定义变量名 in 枚举类型 ]: 类型
  [key in keyof T]: number;
};
