const str = "a=1&a=2&b=3&c=4";

// 包含指定的类型
type IsEqual<A, B> = (A extends B ? true : false) & (B extends A ? true : false);
type Includes<Arr extends unknown[], Item> = Arr extends [infer First, ...infer Rest]
  ? IsEqual<First, Item> extends true
    ? true
    : Includes<Rest, Item>
  : false;

// 解析 key 和 value
// a=1 => {a : 1}
type ParseParam<Str extends string> = Str extends `${infer Key}=${infer Value}`
  ? {
      [K in Key]: Value;
    }
  : {};
type ParseParamRes = ParseParam<"a=1">;

// 合并值为数组
type MergeValue<OneVal, OtherVal> = OtherVal extends unknown[] // 如果是数组
  ? Includes<OtherVal, OneVal> extends true // 如果已经存在
    ? OtherVal
    : [OneVal, ...OtherVal] // 不存在扩展符合并
  : [OneVal, OtherVal]; // 不是数组合并
type MergeValueRes = MergeValue<1, 2>;
type MergeValueRes2 = MergeValue<1, [2]>;
type MergeValueRes3 = MergeValue<1, [1, 2]>;

// 合并多个类型
// { a: 1 }, { a: 2; b: 3 } = {a: [1, 2], b: 2}
type MergeParam<
  OneParam extends Record<string, any>,
  OtherParam extends Record<string, any>
> = {
  // 获取到所有key
  [Key in keyof OneParam | keyof OtherParam]: Key extends keyof OneParam // 如果在 OneParam 中
    ? Key extends keyof OtherParam // 并且已在 OtherParam 中合并值，反之返回值
      ? MergeValue<OneParam[Key], OtherParam[Key]>
      : OneParam[Key]
    : Key extends keyof OtherParam // 在 OtherParam 获取值返回
    ? OtherParam[Key]
    : never;
};
type MergeParamRes = MergeParam<{ a: 1 }, { a: 2; b: 3 }>;

// 提取出参数递归解析
type ParseQueryString<Str extends string> = Str extends `${infer Param}&${infer Rest}`
  ? MergeParam<ParseParam<Param>, ParseQueryString<Rest>>
  : ParseParam<Str>;
type ParseQueryStringRes = ParseQueryString<"a=1&a=2&b=3&c=4">;
