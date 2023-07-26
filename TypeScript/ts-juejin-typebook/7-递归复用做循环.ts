export {};

/**
 * @递归复用
 */

/**
 * @Promise的递归复用
 */
// 提取多层的参数类型
type DeepPromiseValueType<T> = T extends Promise<infer R> ? DeepPromiseValueType<R> : T;
type DeepPromiseValueTypeRes = DeepPromiseValueType<Promise<Promise<Promise<number>>>>; // number
type DeepPromiseValueTypeRes2 = DeepPromiseValueType<number>; // number

/**
 * @数组类型的递归
 */
// 翻转类型数组
type ReverseArr<Arr extends unknown[]> = Arr extends [infer First, ...infer Rest]
  ? [...ReverseArr<Rest>, First]
  : Arr;
type ReverseArrRes = ReverseArr<[1, 2, 3, 4, 5]>; // [5, 4, 3, 2, 1]

// 包含指定的类型
type IsEqual<A, B> = (A extends B ? true : false) & (B extends A ? true : false);
type IsEqualRes = IsEqual<1, 1>;

type IncludesItem<Arr extends unknown[], Item> = Arr extends [infer First, ...infer Rest]
  ? IsEqual<First, Item> extends true
    ? true
    : IncludesItem<Rest, Item>
  : false;
type IncludesItemRes = IncludesItem<[1, 2, 3], 0>;
type IncludesItemRes2 = IncludesItem<[1, 2, 3], 1>;

// 删除执行的类型
type RemoveItem<
  Arr extends unknown[],
  Item,
  Result extends unknown[] = []
> = Arr extends [infer First, ...infer Rest]
  ? IsEqual<First, Item> extends true
    ? RemoveItem<Rest, Item, Result>
    : RemoveItem<Rest, Item, [...Result, First]>
  : Result;
type RemoveItemRes = RemoveItem<[1, 2, 2, 3], 2>;

// 构造数组
// type BuildArray<
//   Length,
//   Item = unknown,
//   Result extends unknown[] = []
// > = Result["length"] extends Length
//   ? Result
//   : BuildArray<Length, Item, [...Result, Item]>;
// type BuildArrayRes = BuildArray<5, number>;

/**
 * @字符串类型的递归
 */
// 全部替换
type ReplaceAll<
  Str extends string,
  From extends string,
  To extends string
> = Str extends `${infer Prefix}${From}${infer Suffix}`
  ? `${Prefix}${To}${ReplaceAll<Suffix, From, To>}`
  : Str;
type ReplaceAllRes = ReplaceAll<"lian lian lian", "l", "L">;

// 拆分字符串
type StringToUnion<Str extends string> = Str extends `${infer First}${infer Rest}`
  ? First | StringToUnion<Rest>
  : never;
type StringToUnionRes = StringToUnion<"lian">;

// 翻转字符串
type ReverseStr<Str extends string> = Str extends `${infer First}${infer Rest}`
  ? `${ReverseStr<Rest>}${First}`
  : Str;
type ReverseStrRes = ReverseStr<"lian">;

/**
 * @对象类型的递归
 */
// TODO: 为什么要 Object extends any 才能显示深层的计算
type DeepReadonly<Obj extends Record<string, any>> = Object extends any
  ? {
      readonly [Key in keyof Obj]: Obj[Key] extends object
        ? Obj[Key] extends Function
          ? Obj[Key]
          : DeepReadonly<Obj[Key]>
        : Obj[Key];
    }
  : never;
type DeepReadonlyRes = DeepReadonly<{ a: { b: 1; c: () => 2 }; d: 3 }>;
