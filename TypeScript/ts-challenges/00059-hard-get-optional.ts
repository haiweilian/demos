// ============= Test Cases =============
import type { Equal, Expect } from "./test-utils";

type cases = [
  Expect<Equal<GetOptional<{ foo: number; bar?: string }>, { bar?: string }>>,
  Expect<Equal<GetOptional<{ foo: undefined; bar?: undefined }>, { bar?: undefined }>>
];

// ============= Your Code Here =============
// tips: 通过 pick 提取一个属性，如果 {} 可以赋值给它则这个属性时可选的，反之是必须的
type res1 = Pick<{ foo: number; bar?: string }, "foo">;
type res2 = Pick<{ foo: number; bar?: string }, "bar">;

type GetOptional<T extends Record<string, any>> = {
  [K in keyof T as {} extends Pick<T, K> ? K : never]: T[K];
};
