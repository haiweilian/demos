export {};
// 1，any 类型与任何类型的交叉都是 any，也就是 1 & any 结果是 any，可以用这个特性判断 any 类型。
// 2，联合类型作为类型参数出现在条件类型左侧时，会分散成单个类型传入，最后合并。
// 3，never 作为类型参数出现在条件类型左侧时，会直接返回 never。
// 4，any 作为类型参数出现在条件类型左侧时，会直接返回 trueType 和 falseType 的联合类型。
// 5，元组类型也是数组类型，但每个元素都是只读的，并且 length 是数字字面量，而数组的 length 是 number。可以用来判断元组类型。
// 6，函数参数处会发生逆变，可以用来实现联合类型转交叉类型。
// 7，可选索引的索引可能没有，那 Pick 出来的就可能是 {}，可以用来过滤可选索引，反过来也可以过滤非可选索引。
// 8，索引类型的索引为字符串字面量类型，而可索引签名不是，可以用这个特性过滤掉可索引签名。
// 9，keyof 只能拿到 class 的 public 的索引，可以用来过滤出 public 的属性。
// 20，默认推导出来的不是字面量类型，加上 as const 可以推导出字面量类型，但带有 readonly 修饰，这样模式匹配的时候也得加上 readonly 才行。

/**
 * @IsAny
 */
type IsAny<T> = 1 extends 2 & T ? true : false;
type IsAnyRes = IsAny<any>;
type IsAnyRes2 = IsAny<1>;

/**
 * @IsEqual
 */
type IsEqual<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
  ? true
  : false;
type IsEqualRes = IsEqual<1, 1>;
type IsEqualRes2 = IsEqual<1, any>;

/**
 * @IsUnion
 */
type IsUnion<A, B = A> = A extends A ? ([B] extends [A] ? false : true) : never;
type IsUnionRes = IsUnion<1 | 2>;
type IsUnionRes2 = IsUnion<1>;

/**
 * @IsNever
 */
type IsNever<T> = [T] extends [never] ? true : false;
type IsNeverRes = IsNever<never>;
type IsNeverRes2 = IsNever<1>;

/**
 * @IsTuple
 */
// TODO: TS 对这种形式的类型做了特殊处理，是一种 hack 的写法[原理篇]
type NotEqual<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
  ? false
  : true;
type NotEqualRes = NotEqual<1, 1>;
type NotEqualRes2 = NotEqual<1, number>;

type IsTuple<T> = T extends readonly [...infer rest]
  ? NotEqual<T["length"], number>
  : false;
type IsTupleRes = IsTuple<[1, 2, 3]>;
type IsTupleRes2 = IsTuple<number[]>;

/**
 * @UnionToIntersection
 */
type TestIntersection =
  | ((a: { a: number }) => unknown)
  | ((a: { a: number; b: number }) => unknown) extends (x: infer R) => unknown
  ? R
  : never;

type UnionToIntersection<T> = (T extends T ? (x: T) => unknown : never) extends (
  x: infer R
) => unknown
  ? R
  : never;
type UnionToIntersectionRes = UnionToIntersection<
  { a: number } | { a: number; b: number }
>;

/**
 * @GetOptional
 */
type GetOptional<O extends Record<string, any>> = {
  [K in keyof O as {} extends Pick<O, K> ? K : never]: O[K];
};
type GetOptionalRes = GetOptional<{
  name: string;
  age?: number;
}>;

/**
 * @GetRequired
 */
type GetRequired<O extends Record<string, any>> = {
  [K in keyof O as {} extends Pick<O, K> ? never : K]: O[K];
};
type GetRequiredRes = GetRequired<{
  name: string;
  age?: number;
}>;

/**
 * @RemoveIndexSignature
 */
type RemoveIndexSignature<O extends Record<string, any>> = {
  [K in keyof O as K extends `${infer N}` ? N : never]: O[K];
};
type RemoveIndexSignatureRes = RemoveIndexSignature<{
  [key: string]: any;
  sleep(): void;
}>;

/**
 * @ClassPublicProps
 */
type ClassPublicProps<O extends Record<string, any>> = {
  [K in keyof O]: O[K];
};
class Dong {
  public name: string;
  protected age: number;
  private hobbies: string[];

  constructor() {
    this.name = "dong";
    this.age = 20;
    this.hobbies = ["sleep", "eat"];
  }
}
type ClassPublicPropsResult = ClassPublicProps<Dong>;

/**
 * @asconst 默认推导的类型转化字面量类型
 */
const arr = [1, 2, 3] as const;
type arr2 = typeof arr;
