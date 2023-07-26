// ============= Test Cases =============
import type { Equal, Expect } from "./test-utils";

type cases = [
  Expect<Equal<Without<[1, 2], 1>, [2]>>,
  Expect<Equal<Without<[1, 2, 4, 1, 5], [1, 2]>, [4, 5]>>,
  Expect<Equal<Without<[2, 3, 2, 3, 2, 3, 2, 3], [2, 3]>, []>>
];

// ============= Your Code Here =============
type Filter<T extends unknown[], U extends unknown> = T extends [infer F, ...infer Rest]
  ? F extends U
    ? Filter<Rest, U>
    : [F, ...Filter<Rest, U>]
  : T;

type Without<T extends unknown[], U extends unknown | unknown[]> = U extends unknown[]
  ? Filter<T, U[number]>
  : Filter<T, U>;
