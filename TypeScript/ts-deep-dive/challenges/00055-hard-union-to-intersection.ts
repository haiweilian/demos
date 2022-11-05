// ============= Test Cases =============
import type { Equal, Expect } from "./test-utils";

type cases = [
  Expect<Equal<UnionToIntersection<"foo" | 42 | true>, "foo" & 42 & true>>,
  Expect<
    Equal<
      UnionToIntersection<(() => "foo") | ((i: 42) => true)>,
      (() => "foo") & ((i: 42) => true)
    >
  >
];

// ============= Your Code Here =============
// 联合类型的函数参数具有逆变的性质，取交集
type UnionToIntersection<U> = (U extends U ? (arg: U) => void : never) extends (
  arg: infer R
) => void
  ? R
  : never;
