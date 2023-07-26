// ============= Test Cases =============
import type { Equal, Expect } from "./test-utils";

type Case1 = AppendArgument<(a: number, b: string) => number, boolean>;
type Result1 = (a: number, b: string, x: boolean) => number;

type Case2 = AppendArgument<() => void, undefined>;
type Result2 = (x: undefined) => void;

type cases = [Expect<Equal<Case1, Result1>>, Expect<Equal<Case2, Result2>>];

// ============= Your Code Here =============
// tips: 把现有的参数和追加的参数合并后一起放入
type AppendArgument<F extends Function, Arg extends unknown> = F extends (
  ...args: infer Args
) => infer R
  ? (...args: [...Args, Arg]) => R
  : F;
