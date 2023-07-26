// ============= Test Cases =============
import type { Equal, Expect } from "./test-utils";

interface Model {
  name: string;
  age: number;
  locations: string[] | null;
}

type ModelEntries = ["name", string] | ["age", number] | ["locations", string[] | null];

type cases = [
  Expect<Equal<ObjectEntries<Model>, ModelEntries>>,
  Expect<Equal<ObjectEntries<Partial<Model>>, ModelEntries>>,
  Expect<Equal<ObjectEntries<{ key?: undefined }>, ["key", undefined]>>,
  Expect<Equal<ObjectEntries<{ key: undefined }>, ["key", undefined]>>
];

// ============= Your Code Here =============
type ObjectEntries<
  T extends Record<string, any>,
  K extends keyof T = keyof T
> = K extends K ? [K, T[K] extends undefined ? undefined : Required<T>[K]] : never;

// 推断出来的 undefined 不能赋值给明写 undefined
type TestUndefind = { key?: string } extends { key?: undefined } ? true : false;
