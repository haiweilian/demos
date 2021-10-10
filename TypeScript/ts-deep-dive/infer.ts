/**
 * @infer 出现在条件类型中，表示在 extends 条件语句中待推断的类型变量。
 */
// infer P 表示待推断的类型，可以想象成占位符
type ParamType<T> = T extends (param: infer P) => any ? P : unknown;

interface User {
  name: string;
  age: number;
}

type Fun = (user: User) => void;

// 因为 T (user: User) => void 往 (param: infer P) => any 上套
// 那么此时的占位符 infer P 就对应上了 User，根据条件判断最终判断 User
type F = ParamType<Fun>; // User

// 因为是 T 是 string 不是赋值给 (param: infer P) => any
type S = ParamType<string>; // unknown
