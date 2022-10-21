export {};

/**
 * @模式匹配
 */
// 通过 infer 获取到匹配的参数类型
type p = Promise<"lian">;
type GetValueType<P> = P extends Promise<infer V> ? V : never;
type p1 = GetValueType<p>; // lian

/**
 * @数组类型
 */
// 获取第一个
type First<Arr extends unknown[]> = Arr extends [infer R, ...unknown[]] ? R : never;
type FirstRes = First<[1, 2, 3]>; // 1

// 获取最后一个
type Last<Arr extends unknown[]> = Arr extends [...unknown[], infer R] ? R : never;
type LastRes = Last<[1, 2, 3]>; // 3

// 删除第一个，如果为空返回空
type ShiftArr<Arr extends unknown[]> = Arr extends []
  ? []
  : Arr extends [unknown, ...infer R]
  ? R
  : never;
type ShiftRes = ShiftArr<[]>; // []
type ShiftRes2 = ShiftArr<[1, 2, 3]>; // [2, 3]

// 删除最后一个
type PopArr<Arr extends unknown[]> = Arr extends []
  ? []
  : Arr extends [...infer R, unknown]
  ? R
  : never;
type PopRes = PopArr<[1, 2, 3]>; // [1, 2]

/**
 * @字符串类型
 */
// 判断是否以指定字符开头，(通过字符模板限制前缀)
type StartsWith<
  Str extends string,
  Prefix extends string
> = Str extends `${Prefix}${string}` ? true : false;
type StartsWithRes = StartsWith<"lian haiwei", "lian">; // true
type StartsWithRes2 = StartsWith<"lian haiwei", "haiwei">; // false

// 替换字符串，匹配出字符串的前后缀，再拼成一个新的类型
type ReplaceStr<
  Str extends string,
  From extends string,
  To extends string
> = Str extends `${infer Prefix}${From}${infer Suffix}` ? `${Prefix}${To}${Suffix}` : Str;
type ReplaceRes = ReplaceStr<"lian haiwei", "hai", "xiao">;

// 删除前后空白字符，
type TrimStrRight<Str extends string> = Str extends `${infer Rest}${" " | "\n"}`
  ? TrimStrRight<Rest>
  : Str;
type TrimStrRightRes = TrimStrRight<"lian   ">;
type TrimStrLeft<Str extends string> = Str extends `${" " | "\n"}${infer Rest}`
  ? TrimStrLeft<Rest>
  : Str;
type TrimStrLeftRes = TrimStrLeft<"   lian">;
type TrimStrRes = TrimStrRight<TrimStrLeft<"   lian   ">>;

/**
 * @函数类型
 */
// 提取函数参数类型
type GetParameters<Fun extends Function> = Fun extends (...arg: infer R) => unknown
  ? R
  : never;
type GetParametersRes = GetParameters<(name: string, age: number) => {}>;

// 提取函数返回值类型
// TODO: 注意，这里不能用 unknown，这里的解释涉及到参数的逆变性质，具体原因逆变那一节会解释
type GetReturnType<Fun extends Function> = Fun extends (...arg: any[]) => infer R
  ? R
  : never;
type GetReturnTypeRes = GetReturnType<() => 1>;

// 提取类函数类型
class Dong {
  name: string;

  constructor() {
    this.name = "dong";
  }

  hello(this: Dong) {
    return "hello, I'm " + this.name;
  }
}

const dong = new Dong();
dong.hello();
// dong.hello.call({ name: "dong" });

type GetThisParameterType<Fun extends Function> = Fun extends (
  this: infer R,
  ...arg: any[]
) => unknown
  ? R
  : never;
type GetThisParameterTypeRes = GetThisParameterType<typeof dong.hello>;

/**
 * @构造器类型
 */
interface Person {
  name: string;
}

interface PersonConstructor {
  new (name: string): Person;
}

type GetInstanceType<C extends new (...args: any) => any> = C extends new (
  ...args: any
) => infer R
  ? R
  : never;
type GetInstanceTypeRes = GetInstanceType<PersonConstructor>;

/**
 * @索引类型
 */
type GetRefProps<Props> = "ref" extends keyof Props
  ? Props extends { ref?: infer R }
    ? R
    : never
  : never;
type GetRefPropsRes = GetRefProps<{ ref: 1 }>;
type GetRefPropsRes2 = GetRefProps<{}>;
