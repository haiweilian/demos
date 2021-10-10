/**
 * @键值获取 keyof
 * 类型 = keyof 类型
 * 对于任何类型`T`，`keyof T`的结果为`T`上已知的公共属性名的联合。
 */
type Person = {
  name: string;
  age: number;
};
type PersonKey = keyof Person; // type PersonKey = "name" | "age";

// 用来约束对象的访问
let PersonObj: Person = { name: "l", age: 23 };
function getValue(obj: Person, key: keyof Person) {
  return obj[key];
}
function getValueOne<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

getValue(PersonObj, "name");
getValueOne(PersonObj, "age");

/**
 * @实例类型获取 typeof
 * 类型 = keyof 实例对象
 * 把实例的值转换成对应的类型
 */
let me: Person = { name: "l", age: 23 };
type Met = typeof me;
// type Met = {
//   name: string;
//   age: number;
// }
type MetKey = keyof Met; // "name" | "age"
type MetKey2 = keyof typeof me; // "name" | "age"

/**
 * @遍历属性 in
 * [自定义变量名 in 联合类型 ]: 类型
 * 如创建一个新的映射类型：从旧类型中创建新类型的一种方式
 */
type TypeToString<T> = {
  // P in 相当于 for ... in 遍历 keyof T，每一项的类型都改为 string
  // 返回一个新类型
  [P in keyof T]: string;
};
type PersonStr = TypeToString<Person>;
// type PersonStr = {
//   name: string;
//   age: string;
// }
