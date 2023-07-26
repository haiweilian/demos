// ============= Test Cases =============
import type { Equal, Expect } from "./test-utils";

type cases = [
  Expect<Equal<FlattenDepth<[]>, []>>,
  Expect<Equal<FlattenDepth<[1, 2, 3, 4]>, [1, 2, 3, 4]>>,
  Expect<Equal<FlattenDepth<[1, [2]]>, [1, 2]>>,
  Expect<Equal<FlattenDepth<[1, 2, [3, 4], [[[5]]]], 2>, [1, 2, 3, 4, [5]]>>,
  Expect<Equal<FlattenDepth<[1, 2, [3, 4], [[[5]]]]>, [1, 2, 3, 4, [[5]]]>>,
  Expect<Equal<FlattenDepth<[1, [2, [3, [4, [5]]]]], 3>, [1, 2, 3, 4, [5]]>>,
  Expect<Equal<FlattenDepth<[1, [2, [3, [4, [5]]]]], 19260817>, [1, 2, 3, 4, 5]>>
];

// ============= Your Code Here =============
type FlattenDepth<
  T extends unknown[],
  D extends number = 1,
  C extends unknown[] = []
> = T extends [infer F, ...infer Rest]
  ? C["length"] extends D
    ? T
    : F extends unknown[]
    ? [...FlattenDepth<F, D, [unknown, ...C]>, ...FlattenDepth<Rest, D, C>]
    : [F, ...FlattenDepth<Rest, D, C>]
  : T;
