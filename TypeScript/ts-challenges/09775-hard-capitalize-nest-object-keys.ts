// ============= Test Cases =============
import type { Equal, Expect } from "./test-utils";
import { ExpectFalse, NotEqual } from "./test-utils";

type foo = {
  foo: string;
  bars: [{ foo: string }];
};

type Foo = {
  Foo: string;
  Bars: [
    {
      Foo: string;
    }
  ];
};

type cases = [Expect<Equal<Foo, CapitalizeNestObjectKeys<foo>>>];

// ============= Your Code Here =============
type CapitalizeNestObjectKeysArray<T extends Record<string, any>[]> = T extends [
  infer Item extends Record<string, any>,
  ...infer Rest extends Record<string, any>[]
]
  ? [CapitalizeNestObjectKeys<Item>, ...CapitalizeNestObjectKeysArray<Rest>]
  : T;

type CapitalizeNestObjectKeys<T extends Record<string, any>> = {
  [K in keyof T as Capitalize<K & string>]: T[K] extends unknown[]
    ? CapitalizeNestObjectKeysArray<T[K]>
    : T[K];
};
