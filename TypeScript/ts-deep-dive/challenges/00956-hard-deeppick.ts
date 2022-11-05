// ============= Test Cases =============
import type { Equal, Expect, UnionToIntersection } from "./test-utils";

type Obj = {
  a: number;
  b: string;
  c: boolean;
  obj: {
    d: number;
    e: string;
    f: boolean;
    obj2: {
      g: number;
      h: string;
      i: boolean;
    };
  };
  obj3: {
    j: number;
    k: string;
    l: boolean;
  };
};

type cases = [
  Expect<Equal<DeepPick<Obj, "">, unknown>>,
  Expect<Equal<DeepPick<Obj, "a">, { a: number }>>,
  Expect<Equal<DeepPick<Obj, "a" | "obj.e">, { a: number } & { obj: { e: string } }>>,
  Expect<
    Equal<
      DeepPick<Obj, "a" | "obj.e" | "obj.obj2.i">,
      { a: number } & { obj: { e: string } } & { obj: { obj2: { i: boolean } } }
    >
  >
];

// ============= Your Code Here =============
type Split<T extends string> = T extends `${infer Item}.${infer Rest}`
  ? [Item, ...Split<Rest>]
  : T extends ""
  ? []
  : [T];
type SplitRes1 = Split<"">;
type SplitRes3 = Split<"obj.obj2.i">;

type PickByKey<T extends Record<string, any>, K extends string[]> = K extends [
  infer Key extends string,
  ...infer Rest extends string[]
]
  ? Record<Key, PickByKey<T[Key], Rest>>
  : T;
type PickByKeyRes1 = PickByKey<Obj, []>;
type PickByKeyRes2 = PickByKey<Obj, ["obj", "obj2", "i"]>;

type DeepPick<T extends Record<string, any>, K extends string> = UnionToIntersection<
  K extends K ? (K extends "" ? unknown : PickByKey<T, Split<K>>) : never
>;
