// ============= Test Cases =============
import type { Equal, Expect } from "./test-utils";

type cases = [
  Expect<Equal<Sum<2, 3>, "5">>,
  Expect<Equal<Sum<"13", "21">, "34">>,
  Expect<Equal<Sum<"328", 7>, "335">>,
  // Expect<Equal<Sum<1_000_000_000_000n, "123">, "1000000000123">>,
  // Expect<Equal<Sum<9999, 1>, "10000">>,
  // Expect<Equal<Sum<4325234, "39532">, "4364766">>,
  Expect<Equal<Sum<728, 0>, "728">>,
  Expect<Equal<Sum<"0", 213>, "213">>,
  Expect<Equal<Sum<0, "0">, "0">>
];

// ============= Your Code Here =============
type BuildArray<
  Num extends string | number | bigint,
  Result extends unknown[] = []
> = `${Result["length"]}` extends `${Num}`
  ? Result
  : BuildArray<Num, [unknown, ...Result]>;

type Sum<A extends string | number | bigint, B extends string | number | bigint> = `${[
  ...BuildArray<A>,
  ...BuildArray<B>
]["length"] &
  number}`;

type x = Sum<2, 3>;
