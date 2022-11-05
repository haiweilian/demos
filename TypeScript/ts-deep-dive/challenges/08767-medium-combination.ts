// ============= Test Cases =============
import type { Equal, Expect } from "./test-utils";

type cases = [
  Expect<
    Equal<
      Combination<["foo", "bar", "baz"]>,
      | "foo"
      | "bar"
      | "baz"
      | "foo bar"
      | "foo bar baz"
      | "foo baz"
      | "foo baz bar"
      | "bar foo"
      | "bar foo baz"
      | "bar baz"
      | "bar baz foo"
      | "baz foo"
      | "baz foo bar"
      | "baz bar"
      | "baz bar foo"
    >
  >
];

// ============= Your Code Here =============
type Combination<T extends string[], U = T[number], I = U> = I extends U
  ? I extends string
    ? I | `${I} ${Combination<T, Exclude<U, I>>}`
    : never
  : never;

// 拆解版
// type GenCombination<A extends string, B extends string> =
//   | A
//   | B
//   | `${A} ${B}`
//   | `${B} ${A}`;
// type GenCombinationRes = GenCombination<"a", "b" | "c">;

// type CombinationAll<A extends string, B extends string = A> = A extends A
//   ? GenCombination<A, CombinationAll<Exclude<B, A>>>
//   : never;

// type Combination<T extends string[]> = CombinationAll<T[number]>;
