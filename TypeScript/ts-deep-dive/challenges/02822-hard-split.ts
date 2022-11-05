// ============= Test Cases =============
import type { Equal, Expect } from "./test-utils";

type cases = [
  Expect<Equal<Split<"Hi! How are you?", "z">, ["Hi! How are you?"]>>,
  Expect<Equal<Split<"Hi! How are you?", " ">, ["Hi!", "How", "are", "you?"]>>,
  Expect<
    Equal<
      Split<"Hi! How are you?", "">,
      ["H", "i", "!", " ", "H", "o", "w", " ", "a", "r", "e", " ", "y", "o", "u", "?"]
    >
  >,
  Expect<Equal<Split<"", "">, []>>,
  Expect<Equal<Split<"", "z">, [""]>>,
  Expect<Equal<Split<string, "whatever">, string[]>>
];

// ============= Your Code Here =============
type Split<
  S extends string,
  SEP extends string
> = S extends `${infer Left}${SEP}${infer Rest}`
  ? [Left, ...Split<Rest, SEP>]
  : S extends ""
  ? SEP extends ""
    ? []
    : [""]
  : Equal<S, string> extends true
  ? string[]
  : [S];

type s = Split<string, "whatever">;
