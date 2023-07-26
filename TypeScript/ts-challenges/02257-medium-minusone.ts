// ============= Test Cases =============
import type { Equal, Expect } from "./test-utils";

type cases = [
  Expect<Equal<MinusOne<1>, 0>>,
  Expect<Equal<MinusOne<55>, 54>>,
  Expect<Equal<MinusOne<3>, 2>>,
  Expect<Equal<MinusOne<100>, 99>>
  // Expect<Equal<MinusOne<1101>, 1100>> 类型实例化过深，且可能无限
];

// ============= Your Code Here =============
type BuildArray<
  T extends number,
  Result extends unknown[] = []
> = Result["length"] extends T ? Result : BuildArray<T, [unknown, ...Result]>;
type BuildArrayRes = BuildArray<10>;

type MinusOne<T extends number> = BuildArray<T> extends [infer D, ...infer Rest]
  ? Rest["length"]
  : never;
