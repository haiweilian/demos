// ============= Test Cases =============
import type { Equal, Expect } from "./test-utils";

const promiseAllTest1 = PromiseAll([1, 2, 3] as const);
const promiseAllTest2 = PromiseAll([1, 2, Promise.resolve(3)] as const);
const promiseAllTest3 = PromiseAll([1, 2, Promise.resolve(3)]);

type cases = [
  Expect<Equal<typeof promiseAllTest1, Promise<[1, 2, 3]>>>,
  Expect<Equal<typeof promiseAllTest2, Promise<[1, 2, number]>>>,
  Expect<Equal<typeof promiseAllTest3, Promise<[number, number, number]>>>
];

// ============= Your Code Here =============
// 拼接版
// type PromiseParams<
//   T extends readonly unknown[],
//   Result extends unknown[] = []
// > = T extends readonly [infer First, ...infer Rest]
//   ? First extends Promise<infer P>
//     ? PromiseParams<Rest, [...Result, P]>
//     : PromiseParams<Rest, [...Result, First]>
//   : Promise<Result>;

// declare function PromiseAll<T extends readonly unknown[]>(
//   values: readonly [...T]
// ): PromiseParams<T>;

// 手动提取版，当 keyof 是一个数组的时候回转化成数组
// declare function PromiseAll<T extends readonly unknown[]>(
//   values: readonly [...T]
// ): Promise<{ [P in keyof T]: T[P] extends Promise<infer R> ? R : T[P] }>;

// 内置工具版
declare function PromiseAll<T extends readonly unknown[]>(
  values: readonly [...T]
): Promise<{ -readonly [P in keyof T]: Awaited<T[P]> }>;
