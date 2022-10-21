export {};

/**
 * @联合分散可简化
 * distributive = 分配特性
 */
type Union = "a" | "b" | "c";
type UppercaseUnion<T extends string> = Uppercase<T>;
type UppercaseUnionRes = UppercaseUnion<Union>;
type StrUnionRes = `${Union}~~~`;

type CamelCase<Str extends string> =
  Str extends `${infer Left}_${infer Right}${infer Rest}`
    ? `${Left}${Uppercase<Right>}${CamelCase<Rest>}`
    : Str;
type CamelCaseRes = CamelCase<"lian_lian_lian" | "hai_hai_hai">;

/**
 * @分布式条件类型
 */
// - T extends U ? X : Y
// - 上面的类型意思是，若`T`能够赋值给`U`，那么类型是`X`，否则为`Y`。

// - string | number extends U ? X : Y
// -- 分布式条件类型如果条件左边是联合类型会会被拆解成
// -- (string extends U ? X : Y) | (number extends U ? X : Y)

// type TestUnion<A, B = A> = { a: A; b: B };
type TestUnion<A, B = A> = A extends A ? { a: A; b: B } : never;
// type TestUnion<A, B = A> = A extends A ? B extends B ? { a: A; b: B } : never : never;
type TestUnionRes = TestUnion<"a" | "b" | "c">;

type IsUnion<A, B = A> = A extends A ? ([B] extends [A] ? false : true) : never;
type IsUnionRes = IsUnion<"a" | "b" | "c">;
type IsUnionRes2 = IsUnion<["a" | "b" | "c"]>;

/**
 * @BEM
 */
// type arrToUnion = ["1", "2", "3"][number];
type BEM<
  B extends string,
  E extends string[],
  M extends string[]
> = `${B}__${E[number]}--${M[number]}`;
type BEMRes = BEM<"a", ["bb", "cc"], ["dd", "ee"]>;

/**
 * @AllCombinations
 */
type Combination<A extends string, B extends string> = A | B | `${A}${B}` | `${B}${A}`;
type CombinationRes = Combination<"a", "b">;

type CombinationAll<A extends string, B extends string = A> = A extends A
  ? Combination<A, CombinationAll<Exclude<B, A>>>
  : never;

type CombinationAllRes = CombinationAll<"a" | "b" | "c">;
