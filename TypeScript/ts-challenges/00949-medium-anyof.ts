// ============= Test Cases =============
import type { Equal, Expect } from "./test-utils";

type cases = [
  Expect<Equal<AnyOf<[1, "test", true, [1], { name: "test" }, { 1: "test" }]>, true>>,
  Expect<Equal<AnyOf<[1, "", false, [], {}]>, true>>,
  Expect<Equal<AnyOf<[0, "test", false, [], {}]>, true>>,
  Expect<Equal<AnyOf<[0, "", true, [], {}]>, true>>,
  Expect<Equal<AnyOf<[0, "", false, [1], {}]>, true>>,
  Expect<Equal<AnyOf<[0, "", false, [], { name: "test" }]>, true>>,
  Expect<Equal<AnyOf<[0, "", false, [], { 1: "test" }]>, true>>,
  Expect<Equal<AnyOf<[0, "", false, [], { name: "test" }, { 1: "test" }]>, true>>,
  Expect<Equal<AnyOf<[0, "", false, [], {}]>, false>>,
  Expect<Equal<AnyOf<[]>, false>>
];

// ============= Your Code Here =============
// type IsTrue<T> = T extends 0
//   ? false
//   : T extends ""
//   ? false
//   : T extends false
//   ? false
//   : T extends []
//   ? false
//   : {} extends T
//   ? false
//   : true;

// type AnyOf<T extends readonly any[]> = T extends [infer F, ...infer Rest]
//   ? IsTrue<F> extends true
//     ? true
//     : AnyOf<Rest>
//   : false;

type AnyOf<T extends readonly any[]> = T extends [infer F, ...infer Rest]
  ? F extends 0 | "" | false | [] | Record<string, never>
    ? AnyOf<Rest>
    : true
  : false;

// todo: {} 为什么不等于 Record<string, never>
