// ============= Test Cases =============
import type { Equal, Expect } from "./test-utils";

type cases = [
  Expect<Equal<TwoSum<[3, 3], 6>, true>>,
  Expect<Equal<TwoSum<[3, 2, 4], 6>, true>>,
  Expect<Equal<TwoSum<[2, 7, 11, 15], 15>, false>>,
  Expect<Equal<TwoSum<[2, 7, 11, 15], 9>, true>>,
  Expect<Equal<TwoSum<[1, 2, 3], 0>, false>>,
  Expect<Equal<TwoSum<[1, 2, 3], 1>, false>>,
  Expect<Equal<TwoSum<[1, 2, 3], 2>, false>>,
  Expect<Equal<TwoSum<[1, 2, 3], 3>, true>>,
  Expect<Equal<TwoSum<[1, 2, 3], 4>, true>>,
  Expect<Equal<TwoSum<[1, 2, 3], 5>, true>>,
  Expect<Equal<TwoSum<[1, 2, 3], 6>, false>>
];

// ============= Your Code Here =============
// 构建指定数量的数组
type BuildArray<
  Length extends number,
  Item = unknown,
  Result extends unknown[] = []
> = Result["length"] extends Length
  ? Result
  : BuildArray<Length, Item, [...Result, Item]>;

// 两个数字相减
type Subtract<A extends number, B extends number> = BuildArray<A> extends [
  ...args1: BuildArray<B>,
  ...args2: infer Rest
]
  ? Rest["length"]
  : 0;

// 两数之和
type TwoSum<
  Nums extends number[],
  Target extends number,
  Cache extends unknown[] = []
> = Nums extends [infer Num extends number, ...infer Rest extends number[]]
  ? Subtract<Target, Num> extends Cache[number]
    ? true
    : TwoSum<Rest, Target, [Num, ...Cache]>
  : false;

type twoSumRes1 = TwoSum<[1, 2, 3], 0>;
