// ============= Test Cases =============
import type { Equal, Expect } from "./test-utils";

type cases = [
  Expect<Equal<DropString<"butter fly!", "">, "butter fly!">>,
  Expect<Equal<DropString<"butter fly!", " ">, "butterfly!">>,
  Expect<Equal<DropString<"butter fly!", "but">, "er fly!">>,
  Expect<Equal<DropString<" b u t t e r f l y ! ", "but">, "     e r f l y ! ">>,
  Expect<Equal<DropString<"    butter fly!        ", " ">, "butterfly!">>,
  Expect<Equal<DropString<" b u t t e r f l y ! ", " ">, "butterfly!">>,
  Expect<Equal<DropString<" b u t t e r f l y ! ", "but">, "     e r f l y ! ">>,
  Expect<Equal<DropString<" b u t t e r f l y ! ", "tub">, "     e r f l y ! ">>,
  Expect<Equal<DropString<" b u t t e r f l y ! ", "b">, "  u t t e r f l y ! ">>,
  Expect<Equal<DropString<" b u t t e r f l y ! ", "t">, " b u   e r f l y ! ">>
];

// ============= Your Code Here =============
type DropString<S extends string, R extends string> = R extends `${infer P1}${infer P2}`
  ? S extends `${infer Left}${P1}${infer Rest}`
    ? DropString<`${Left}${DropString<Rest, P1>}`, P2>
    : S
  : S;

type DropStringRes = DropString<"butter fly!", "but">;
