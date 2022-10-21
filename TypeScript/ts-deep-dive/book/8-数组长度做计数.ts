export {};

/**
 * @数组长度做计数
 */

/**
 * @数组长度实现加减乘除
 */

// 构建数组
type BuildArray<
  Length extends number,
  Item = unknown,
  Result extends unknown[] = []
> = Result["length"] extends Length
  ? Result
  : BuildArray<Length, Item, [...Result, Item]>;
// type BuildArrayRes = BuildArray<5, number>;

// 加
type Add<A extends number, B extends number> = [
  ...BuildArray<A>,
  ...BuildArray<B>
]["length"];
type Res = Add<3, 5>;

// 减
type Subtract<A extends number, B extends number> = BuildArray<A> extends [
  ...args1: BuildArray<B>,
  ...args2: infer Rest
]
  ? Rest["length"]
  : never;
type SubtractRes = Subtract<5, 3>;

// 乘 3 * 5 = 3 + 3 + 3 + 3 + 3
type Mutiply<
  A extends number,
  B extends number,
  Result extends unknown[] = []
> = B extends 0
  ? Result["length"]
  : Mutiply<A, Subtract<B, 1>, [...Result, ...BuildArray<A>]>;
type MutiplyRes = Mutiply<3, 5>;

// 除 9 / 3 = 9 - 3 - 3 - 3 = 0
type Divide<
  A extends number,
  B extends number,
  Result extends unknown[] = []
> = A extends 0 ? Result["length"] : Divide<Subtract<A, B>, B, [unknown, ...Result]>;
type DivideRes = Divide<9, 3>;

/**
 * @数组长度实现计数
 */
// 字符串长度
type StrLen<
  Str extends string,
  Result extends unknown[] = []
> = Str extends `${infer First}${infer Rest}`
  ? StrLen<Rest, [unknown, ...Result]>
  : Result["length"];
type StrLenRes = StrLen<"lian">;

// 比较
type GreaterThan<
  A extends number,
  B extends number,
  Result extends unknown[] = []
> = A extends B
  ? false
  : Result["length"] extends B
  ? true
  : Result["length"] extends A
  ? false
  : GreaterThan<A, B, [unknown, ...Result]>;
type GreaterThanRes = GreaterThan<5, 3>;

// Fibonacci 1、1、2、3、5、8、13、21、34
type FibonacciLoop<
  PrevArr extends unknown[],
  CurArr extends unknown[],
  IdxArr extends unknown[],
  Num extends number
> = IdxArr["length"] extends Num
  ? CurArr["length"]
  : FibonacciLoop<CurArr, [...PrevArr, ...CurArr], [unknown, ...IdxArr], Num>;
type Fibonacci<Num extends number> = FibonacciLoop<[], [unknown], [], Num>;
type FibonacciRes = Fibonacci<8>;
