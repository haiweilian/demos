export {};

/**
 * @重新构造
 */

/**
 * @数组类型的重新构造
 */
// 往后添加
type Push<Arr extends unknown[], Ele> = [...Arr, Ele];
type PushRes = Push<[1, 2, 3], 5>;

// 往前添加
type Unshift<Arr extends unknown[], Ele> = [Ele, ...Arr];
type UnshiftRes = Unshift<[1, 2, 3], 0>;

// 合并数组
// type Zip<OneArr extends [unknown, unknown], TwoArr extends [unknown, unknown]> = OneArr extends [infer OneFirst, infer OneSecond]
//   ? TwoArr extends [infer TwoFirst, infer TwoSecond]
//     ? [[OneFirst, TwoFirst], [OneSecond, TwoSecond]]
//     : []
//   : [];
// type ZipRes = Zip<[1, 2], ["1", "2"]>;

type Zip<OneArr extends unknown[], TwoArr extends unknown[]> = OneArr extends [
  infer OneFirst,
  ...infer OneRest
]
  ? TwoArr extends [infer TwoFirst, ...infer TwoRest]
    ? [[OneFirst, TwoFirst], ...Zip<OneRest, TwoRest>]
    : []
  : [];

type ZipRes = Zip<[1, 2, 3], ["1", "2", "3"]>;

/**
 * @数组类型的重新构造
 */
// 首字母转换为大写
type CapitalizeStr<Str extends string> = Str extends `${infer First}${infer Rest}`
  ? `${Uppercase<First>}${Rest}`
  : never;
type CapitalizeStrRes = CapitalizeStr<"lian">;

// 转为为驼峰
type CamelCase<Str extends string> =
  Str extends `${infer Left}_${infer Right}${infer Rest}`
    ? `${Left}${Uppercase<Right>}${CamelCase<Rest>}`
    : Str;
type CamelCaseRes = CamelCase<"lian_lian_lian">;

/**
 * @函数类型的重新构造
 */
// 添加函数参数
type AppendArgument<Fun extends Function, Arg> = Fun extends (
  ...arg: infer Args
) => infer R
  ? (...args: [...Args, Arg]) => R
  : never;
type AppendArgumentRes = AppendArgument<(a: number) => 1, number>;

/**
 * @索引类型的重新构造
 */
// ：：映射类型
type Mapping<Obj extends object> = {
  [Key in keyof Obj]: [Obj[Key], Obj[Key], Obj[Key]];
};
type MappingRes = Mapping<{ a: number; b: number }>;

// key 转化为大写重映射
type UppercaseKey<Obj extends Record<string, any>> = {
  [Key in keyof Obj as Uppercase<Key & string>]: Obj[Key];
};
type UppercaseKeyRes = UppercaseKey<{ a: number; b: number }>;

// 添加只读标识
type ToReadonly<Obj extends Record<string, any>> = {
  readonly [Key in keyof Obj]: Obj[Key];
};
type ToReadonlyRes = ToReadonly<{ a: number; b: number }>;

// 添加可选标识
type ToPartial<Obj extends Record<string, any>> = {
  [Key in keyof Obj]?: Obj[Key];
};
type ToPartialRes = ToPartial<{ a: number; b: number }>;

// 删除只读标识
type ToMutable<Obj extends Record<string, any>> = {
  -readonly [Key in keyof Obj]: Obj[Key];
};
type ToMutableRes = ToMutable<{ readonly a: number; b: number }>;

// 删除可选标识
type ToRequired<Obj extends Record<string, any>> = {
  [Key in keyof Obj]-?: Obj[Key];
};
type ToRequiredRes = ToRequired<{ a?: number; b?: number }>;

// 根据值过滤类型
type FilterByValueType<Obj extends Record<string, any>, ValueType> = {
  [Key in keyof Obj as Obj[Key] extends ValueType ? Key : never]: Obj[Key];
};
type FilterByValueTypeRes = FilterByValueType<{ a: number; b: string }, number>;
type FilterByValueTypeRes2 = FilterByValueType<{ a: number; b: string }, string>;
