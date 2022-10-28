// ============= Test Cases =============
import type { Equal, Expect } from "./test-utils";

type cases = [
  Expect<Equal<Last<[3, 2, 1]>, 1>>,
  Expect<Equal<Last<[() => 123, { a: string }]>, { a: string }>>
];

// ============= Your Code Here =============
type Last<T extends unknown[]> = T extends [...infer Rest, infer Last] ? Last : never;
