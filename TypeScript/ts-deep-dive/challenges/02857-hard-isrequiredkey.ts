// ============= Test Cases =============
import type { Equal, Expect } from "./test-utils";

type cases = [
  Expect<Equal<IsRequiredKey<{ a: number; b?: string }, "a">, true>>,
  Expect<Equal<IsRequiredKey<{ a: number; b?: string }, "b">, false>>,
  Expect<Equal<IsRequiredKey<{ a: number; b?: string }, "b" | "a">, false>>
];

// ============= Your Code Here =============
type RequiredKey<T, K extends keyof T> = K extends K
  ? {} extends Pick<T, K>
    ? false
    : true
  : never;

// false | true => boolean
type IsRequiredKey<T, K extends keyof T> = boolean extends RequiredKey<T, K>
  ? false
  : RequiredKey<T, K>;
