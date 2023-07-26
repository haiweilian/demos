// ============= Test Cases =============
import type { Equal, Expect } from "./test-utils";

type cases = [
  Expect<Equal<FlipArguments<() => boolean>, () => boolean>>,
  Expect<Equal<FlipArguments<(foo: string) => number>, (foo: string) => number>>,
  Expect<
    Equal<
      FlipArguments<(arg0: string, arg1: number, arg2: boolean) => void>,
      (arg0: boolean, arg1: number, arg2: string) => void
    >
  >
];

type errors = [
  // @ts-expect-error
  FlipArguments<"string">,
  // @ts-expect-error
  FlipArguments<{ key: "value" }>,
  // @ts-expect-error
  FlipArguments<["apple", "banana", 100, { a: 1 }]>,
  // @ts-expect-error
  FlipArguments<null | undefined>
];

// ============= Your Code Here =============
// 翻转数组
type Reverse<Arr extends unknown[]> = Arr extends [infer First, ...infer Rest]
  ? [...Reverse<Rest>, First]
  : Arr;
type ReverseRes = Reverse<[1, 2, 3]>;

// tips: 把参数当成数组翻转
type FlipArguments<Fn extends Function> = Fn extends (...args: infer P) => unknown
  ? (...args: Reverse<P>) => ReturnType<Fn>
  : Fn;
