//
export {};

/**
 * @KebabCaseToCamelCase
 * aa-bb-cc => aaBbCc
 */
type KebabCaseToCamelCase<Str extends string> = Str extends `${infer First}-${infer Rest}`
  ? `${First}${KebabCaseToCamelCase<Capitalize<Rest>>}`
  : Str;
type KebabCaseToCamelCaseRes = KebabCaseToCamelCase<"aa-bb-cc">;

/**
 * @CamelCaseToKebabCase
 * aaBbCc => aa-bb-cc
 */
type CamelCaseToKebabCase<Str extends string> = Str extends `${infer First}${infer Rest}`
  ? First extends Lowercase<First>
    ? `${First}${CamelCaseToKebabCase<Rest>}`
    : `-${Lowercase<First>}${CamelCaseToKebabCase<Rest>}`
  : Str;
type CamelCaseToKebabCaseRes = CamelCaseToKebabCase<"aaBbCc">;

/**
 * @Chunk
 * [1, 2, 3, 4, 5] => [[1, 2],[3, 4],[5]]
 */
type Chunk<
  Arr extends unknown[], // 原始数组
  Len extends number, // 拆分的个数
  CurItem extends unknown[] = [], // 现在提取了多少个
  Res extends unknown[] = [] // 拆分的结果
> = Arr extends [infer First, ...infer Rest] // 每次提取一个
  ? CurItem["length"] extends Len
    ? Chunk<Rest, Len, [First], [...Res, CurItem]> // 如果到达指定的个数放到 Res 中
    : Chunk<Rest, Len, [...CurItem, First], Res> // 没有到达往 CurItem 存储
  : [...Res, CurItem]; // 最后返回 Res 和剩余的
type ChunkRes = Chunk<[1, 2, 3, 4, 5], 2>;

/**
 * @PartialObjectPropByKeys
 * { name: string, age: number } => { name: string, age?: number }
 */
type Copy<Obj extends Record<string, any>> = {
  [Key in keyof Obj]: Obj[Key];
};
type PartialObjectPropByKeys<Obj extends Record<string, any>, Key extends string> = Copy<
  Partial<Pick<Obj, Key>> & Omit<Obj, Key>
>; // 排除可选的
type PartialObjectPropByKeysRes = PartialObjectPropByKeys<
  { name: string; age: number },
  "age"
>;
