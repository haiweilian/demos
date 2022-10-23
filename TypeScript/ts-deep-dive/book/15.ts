export {};

/**
 * @UnionToTuple
 */
type funs = ((x: number) => 1) & ((y: number) => 2);
type funr = ReturnType<funs>; // 交叉类型函数的返回值取最后一个

// 把联合类型转化为交叉类型
type UnionToIntersection<U> = (U extends any ? (x: U) => unknown : never) extends (
  x: infer R
) => unknown
  ? R
  : never;

// 测试把多个函数转
type UnionToIntersectionRes = UnionToIntersection<
  ((x: number) => 1) | ((y: number) => 2)
>;
type UnionToIntersectionReturn = ReturnType<UnionToIntersectionRes>;

type UnionToTuple<T extends string> = UnionToIntersection<
  T extends any ? () => T : never // 转为交叉类型
> extends () => infer R // 提取最后一个的返回值
  ? [...UnionToTuple<Exclude<T, R>>, R] // 把已经获取类型排除，递归下次提取
  : [];
type UnionToTupleRes = UnionToTuple<"1" | "2" | "3">;

/**
 * @join
 * join('-')('guang', 'and', 'dong') => guang-and-dong
 */
declare function join<Delimiter extends string>(
  delimiter: Delimiter
): <Items extends string[]>(...parts: Items) => JoinType<Items, Delimiter>;

type RemoveFirstDelimiter<Str extends string> = Str extends `${infer _}${infer Rest}`
  ? Rest
  : Str;

type JoinType<
  Items extends any[],
  Delimiter extends string,
  Result extends string = ""
> = Items extends [infer First, ...infer Rest]
  ? JoinType<Rest, Delimiter, `${Result}${Delimiter}${First & string}`>
  : RemoveFirstDelimiter<Result>;

const joinRes = join("-")("guang", "and", "dong");

/**
 * @DeepCamelize
 * type obj = {
    aaa_bbb: string;
    bbb_ccc: [
        {
            ccc_ddd: string;
        },
        {
            ddd_eee: string;
            eee_fff: {
                fff_ggg: string;
            }
        }
    ]
}

type DeepCamelizeRes = {
    aaaBbb: string;
    bbbCcc: [{
        cccDdd: string;
    }, {
        dddEee: string;
        eeeFff: {
            fffGgg: string;
        };
    }];
}
 */
type ArrCamelize<Arr> = Arr extends [infer First, ...infer Rest]
  ? [DeepCamelize<First>, ...ArrCamelize<Rest>]
  : [];

type DeepCamelize<Obj> = Obj extends unknown[]
  ? ArrCamelize<Obj>
  : {
      [Key in keyof Obj as Key extends `${infer Left}_${infer Right}`
        ? `${Left}${Capitalize<Right>}`
        : Key]: DeepCamelize<Obj[Key]>;
    };

type DeepCamelizeRes = DeepCamelize<{
  aaa_bbb: string;
  bbb_ccc: [
    {
      ccc_ddd: string;
    },
    {
      ddd_eee: string;
      eee_fff: {
        fff_ggg: string;
      };
    }
  ];
}>;

/**
 * @AllKeyPath
 * type Obj = {
    a: {
        b: {
            b1: string
            b2: string
        }
        c: {
            c1: string;
            c2: string;
        }
    },
}
 */
type AllKeyPath<Obj extends Record<string, any>> = {
  [Key in keyof Obj]: Key extends string
    ? Obj[Key] extends Record<string, any>
      ? Key | `${Key}.${AllKeyPath<Obj[Key]>}`
      : Key
    : never;
}[keyof Obj];
type AllKeyPathRes = AllKeyPath<{
  a: {
    b: {
      b1: string;
      b2: string;
    };
    c: {
      c1: string;
      c2: string;
    };
  };
}>;
