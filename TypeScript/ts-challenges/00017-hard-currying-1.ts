// ============= Test Cases =============
import type { Equal, Expect } from "./test-utils";

const curried1 = Currying((a: string, b: number, c: boolean) => true);
const curried2 = Currying(
  (a: string, b: number, c: boolean, d: boolean, e: boolean, f: string, g: boolean) =>
    true
);

type cases = [
  Expect<Equal<typeof curried1, (a: string) => (b: number) => (c: boolean) => true>>,
  Expect<
    Equal<
      typeof curried2,
      (
        a: string
      ) => (
        b: number
      ) => (
        c: boolean
      ) => (d: boolean) => (e: boolean) => (f: string) => (g: boolean) => true
    >
  >
];

// ============= Your Code Here =============
let fn1 = () => 1;
let fn2 = (x: number) => 1;
fn2 = fn1;
type arr = [1, 2] extends [] ? true : false;

// 每次提取一个函数参数构建一个新函数。剩余参数递归构建作为上个函数的返回值
type CurryingReturn<T> = T extends (arg: infer First, ...args: infer Rest) => infer R
  ? Rest extends []
    ? T
    : (arg: First) => CurryingReturn<(...args: Rest) => R>
  : T;

declare function Currying<T>(fn: T): CurryingReturn<T>;
