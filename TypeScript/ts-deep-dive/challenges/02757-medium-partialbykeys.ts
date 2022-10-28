// ============= Test Cases =============
import type { Equal, Expect } from "./test-utils";

interface User {
  name: string;
  age: number;
  address: string;
}

interface UserPartialName {
  name?: string;
  age: number;
  address: string;
}

interface UserPartialNameAndAge {
  name?: string;
  age?: number;
  address: string;
}

type cases = [
  Expect<Equal<PartialByKeys<User, "name">, UserPartialName>>,
  Expect<Equal<PartialByKeys<User, "name" | "unknown" | "xxx">, UserPartialName>>,
  Expect<Equal<PartialByKeys<User, "name" | "age">, UserPartialNameAndAge>>,
  Expect<Equal<PartialByKeys<User>, Partial<User>>>
];

// ============= Your Code Here =============
type Copy<T extends Record<string, any>> = {
  [K in keyof T]: T[K];
};
type PartialByKeys<T extends Record<string, any>, K = keyof T> = Copy<
  Partial<Pick<T, keyof T & K>> & Omit<T, keyof T & K>
>;

type xx = PartialByKeys<User>;
