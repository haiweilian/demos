// ============= Test Cases =============
import type { Equal, Expect } from "./test-utils";

type cases = [
  Expect<Equal<LastIndexOf<[1, 2, 3, 2, 1], 2>, 3>>,
  Expect<Equal<LastIndexOf<[2, 6, 3, 8, 4, 1, 7, 3, 9], 3>, 7>>,
  Expect<Equal<LastIndexOf<[4, 2, 3, 2, 1], 4>, 0>>,
  Expect<Equal<LastIndexOf<[0, 0, 0], 2>, -1>>,
  Expect<Equal<LastIndexOf<[string, 2, number, "a", number, 1], number>, 4>>,
  Expect<Equal<LastIndexOf<[string, any, 1, number, "a", any, 1], any>, 5>>
];

// ============= Your Code Here =============
// 从后往前
type LastIndexOf<T extends unknown[], U extends unknown> = T extends [
  ...infer Rest,
  infer F
]
  ? Equal<F, U> extends true
    ? Rest["length"]
    : LastIndexOf<Rest, U>
  : -1;

// 从前往后
// type LastIndexOf<
//   T extends unknown[],
//   U extends unknown,
//   R extends unknown[] = [],
//   Temp extends unknown[] = [],
//   IsHas extends boolean = false
// > =
//   T extends [infer F,  ...infer Rest]
//   ? Equal<F, U> extends true
//   ? LastIndexOf<Rest, U, [...R, ...Temp], [unknown], true>
//   : LastIndexOf<Rest, U, R, [unknown, ...Temp], IsHas>
//  : IsHas extends true ? R['length'] : -1
