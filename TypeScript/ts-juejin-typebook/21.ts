export {};

// 触发的联合分布式条件类型
type Test1<T> = T extends number ? 1 : 2;
type res1 = Test1<1 | "a">;

// boolean 会转成 true | false 的联合类型
type Test2<T> = T extends true ? 1 : 2;
type res2 = Test2<boolean>;

// any 时返回 trueType 和 falseType 的联合类型
type Test3<T> = T extends true ? 1 : 2;
type res3 = Test3<any>;

// never 时直接返回never
type Test4<T> = T extends true ? 1 : 2;
type res4 = Test4<never>;
