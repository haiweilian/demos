/**
 * @desc 类型五子棋玩法介绍
 *
 * 建议复制到本地玩耍，Playground 性能和提示不友好。
 *
 * 一、滚动到最底部找到 “开始对局” 开始。
 *
 * 二、通过 “落子("⚫", "01-02")” 黑白交替落子，其中 “01” 为横线点，“02” 为纵线点，两者形成的交叉点为落子点。
 *
 * 三、鼠标放在 “棋盘状态”、“对局状态” 查看当前实时的棋盘状态。
 *
 */

/**
 * @desc 工具类
 */
export type 转数字<S extends string> = S extends `0${infer R extends number}` ? R : S extends `${infer R extends number}` ? R : never;
// test
// type 测试转数字一 = 转数字<"01">;
// type 测试转数字二 = 转数字<"10">;

export type 转字符串<N extends number> = 比较<10, N> extends true ? `0${N}` : `${N}`;
// test
// type 测试转转字符串一 = 转字符串<1>;
// type 测试转转字符串二 = 转字符串<10>;

export type 加<A extends number, B extends number> = [...构建数组<A>, ...构建数组<B>]["length"];
// test
// type 测试加 = 加<3, 5>;

export type 减<A extends number, B extends number> = 构建数组<A> extends [...args1: 构建数组<B>, ...args2: infer Rest] ? Rest["length"] : never;
// test
// type 测试减 = 减<5, 3>;

export type 比较<A extends number, B extends number, Result extends unknown[] = []> = A extends B
  ? false
  : Result["length"] extends B
  ? true
  : Result["length"] extends A
  ? false
  : 比较<A, B, [unknown, ...Result]>;
// test
// type 测试比较 = 比较<10, 5>;

export type 构建数组<Length extends number, Item = unknown, Result extends unknown[] = []> = Result["length"] extends Length
  ? Result
  : 构建数组<Length, Item, [...Result, Item]>;
// test
// type 测试构建数组 = 构建数组<5, number>;

/**
 * @desc 一、创建棋盘信息
 * 1、创建一个固定的棋盘。(TODO: 太大的棋盘显示有问题)
 * 2、创建横纵的交叉点，限制落子的位置。
 */
type 黑棋 = "⚫";
type 白棋 = "⚪";
type 棋子 = 黑棋 | 白棋;

type 棋盘 = {
  "00": ["01", "02", "03", "04", "05", "06", "07", "08", "09"];
  "01": ["□□", "□□", "□□", "□□", "□□", "□□", "□□", "□□", "□□"];
  "02": ["□□", "□□", "□□", "□□", "□□", "□□", "□□", "□□", "□□"];
  "03": ["□□", "□□", "□□", "□□", "□□", "□□", "□□", "□□", "□□"];
  "04": ["□□", "□□", "□□", "□□", "□□", "□□", "□□", "□□", "□□"];
  "05": ["□□", "□□", "□□", "□□", "□□", "□□", "□□", "□□", "□□"];
  "06": ["□□", "□□", "□□", "□□", "□□", "□□", "□□", "□□", "□□"];
  "07": ["□□", "□□", "□□", "□□", "□□", "□□", "□□", "□□", "□□"];
  "08": ["□□", "□□", "□□", "□□", "□□", "□□", "□□", "□□", "□□"];
  "09": ["□□", "□□", "□□", "□□", "□□", "□□", "□□", "□□", "□□"];
};

type 横点 = "01" | "02" | "03" | "04" | "05" | "06" | "07" | "08" | "09";
type 纵点 = "01" | "02" | "03" | "04" | "05" | "06" | "07" | "08" | "09";
type 落子信息 = [棋子, 横点, 纵点];

type 交叉点 = `${横点}-${纵点}`;
type 拆分交叉点<S extends 交叉点> = S extends `${infer _横点}-${infer _纵点}` ? [_横点, _纵点] : [];
// test
// type 测试拆分交叉点 = 拆分交叉点<"05-05">;

/**
 * @desc 二、创建交替落子
 * 1. 如果上一步是【白棋】下的，那么下一步为【黑棋】下。反之如果上一步是【黑棋】下的，那么下一步为【白棋】下。
 * 2. 如果当前位置中已有棋子则不能下棋。
 * 3. 创建一个颗粒化函数，每执行一次都返回一个新的函数限制落子的位置。
 */
type 交替落子限制<
  可下棋子 extends 棋子 = 棋子,
  可下交叉点 extends 交叉点 = 交叉点,
  已下棋子 extends 棋子 | "" = "",
  已下交叉点 extends 交叉点 | "" = "",
  落子集合 extends 落子信息[] = []
> = {
  落子: <当前棋子 extends 可下棋子, 当前交叉点 extends 可下交叉点>(
    棋子参数: 当前棋子,
    交叉点参数: 当前交叉点
  ) => 判断胜利<落子集合, 当前交叉点 extends 交叉点 ? [当前棋子, ...拆分交叉点<当前交叉点>] : []> extends `对局结束${infer 模糊字符}`
    ? {
        落子结果: 当前交叉点 extends 交叉点 ? [...落子集合, [当前棋子, ...拆分交叉点<当前交叉点>]] : 落子集合;
        棋盘状态: 渲染棋盘<更新棋盘<棋盘, 当前交叉点 extends 交叉点 ? [...落子集合, [当前棋子, ...拆分交叉点<当前交叉点>]] : 落子集合>>;
        对局状态: 判断胜利<
          当前交叉点 extends 交叉点 ? [...落子集合, [当前棋子, ...拆分交叉点<当前交叉点>]] : 落子集合,
          当前交叉点 extends 交叉点 ? [当前棋子, ...拆分交叉点<当前交叉点>] : []
        >;
      }
    : 交替落子限制<
        Exclude<棋子, 当前棋子>,
        Exclude<交叉点, 已下交叉点 | 当前交叉点>,
        已下棋子,
        已下交叉点 | 当前交叉点,
        当前交叉点 extends 交叉点 ? [...落子集合, [当前棋子, ...拆分交叉点<当前交叉点>]] : 落子集合
      >;
  落子结果: 落子集合;
};

declare function 创建交替落子(): 交替落子限制;
const 交替落子 = 创建交替落子();
// test
// const 测试交替落子 = 交替落子.落子("⚫", "01-01").落子("⚪", "01-02");
// const 测试交替落子结果 = 测试交替落子["落子结果"];

/**
 * @desc 三、更新棋盘
 * 1. 根据【当前纵点】找到对应的横点集合。
 * 2. 根据【当前横点】和【横点集合】找到对应的位置更新为【当前棋子】。
 */
type 更新棋盘交叉点<横点集合 extends string[], 当前落子 extends 落子信息, 当前索引 extends unknown[] = [unknown]> = 横点集合 extends [
  infer _横点,
  ...infer _剩余横点 extends string[]
]
  ? 当前索引["length"] extends 转数字<当前落子[2]>
    ? [当前落子[0], ...更新棋盘交叉点<_剩余横点, 当前落子, [unknown, ...当前索引]>]
    : [_横点, ...更新棋盘交叉点<_剩余横点, 当前落子, [unknown, ...当前索引]>]
  : [];
// test
// type 测试更新棋盘交叉点 = 更新棋盘交叉点<["□□", "□□", "□□"], ["⚫", "01", "02"]>;

type 更新一次棋盘<当前棋盘 extends Record<string, string[]>, 当前落子 extends 落子信息> = {
  [_纵点 in keyof 当前棋盘]: _纵点 extends 当前落子[1] ? 更新棋盘交叉点<当前棋盘[_纵点], 当前落子> : 当前棋盘[_纵点];
};
// test
// type 测试更新一次棋盘 = 更新一次棋盘<棋盘, ["⚫", "05", "05"]>;

type 更新棋盘<当前棋盘 extends Record<string, string[]>, 落子集合 extends 落子信息[]> = 落子集合 extends [
  infer _当前落子 extends 落子信息,
  ...infer _剩余落子 extends 落子信息[]
]
  ? 更新棋盘<更新一次棋盘<当前棋盘, _当前落子>, _剩余落子>
  : 当前棋盘;
// test
// type 测试更新棋盘 = 更新棋盘<棋盘, [["⚫", "04", "04"], ["⚪", "05", "05"]]>;

/**
 * @desc 四、判断胜利
 * 1. 如果横连、纵连、左斜连、右斜连达到五个为胜利。
 * 2. 以最后一次落子的位置向四条线八个方向开始查找。
 *    1. 横连：向左查找【横点递减并纵点相同】的棋子 和 向右查找【横点递增并纵点相同】的棋子。
 *    2. 纵连：向上查找【纵点递减并横点相同】的棋子 和 向下查找【纵点递增并横点相同】的棋子。
 *    3. 左斜连：向左下查找【横点递减同时纵点递增】的棋子 和 向右上查找【横点递增同时纵点递减】的棋子。
 *    4. 右斜连：向左上查找【横点递减同时纵点递减】的棋子 和 向右下查找【横点递增同时纵点递增】的棋子。
 */
type 查找类型 = 0 | 1 | -1; // 0: 不变、1: 递增、-1：递减
type 查找方向 = [查找类型, 查找类型]; // [横点查找类型, 纵点查找类型]
type 下一次查找位置<当前位置 extends string, 当前查找类型 extends 查找类型> = 当前查找类型 extends 0
  ? 当前位置
  : 当前查找类型 extends 1
  ? 加<转数字<当前位置>, 1> extends number
    ? 转字符串<加<转数字<当前位置>, 1>>
    : "00"
  : 当前查找类型 extends -1
  ? 减<转数字<当前位置>, 1> extends number
    ? 转字符串<减<转数字<当前位置>, 1>>
    : "00"
  : "00";
// test
// type 测试下一次查找位置不变 = 下一次查找位置<"01", 0>;
// type 测试下一次查找位置递增 = 下一次查找位置<"01", 1>;
// type 测试下一次查找位置递减 = 下一次查找位置<"02", -1>;

type 查找当前落子<落子集合 extends 落子信息[], 当前落子 extends 落子信息> = 落子集合 extends [
  infer _当前落子 extends 落子信息,
  ...infer _剩余落子 extends 落子信息[]
]
  ? _当前落子 extends 当前落子
    ? _当前落子
    : 查找当前落子<_剩余落子, 当前落子>
  : [];

type 查找连续落子<落子集合 extends 落子信息[], 最后一次落子 extends 落子信息, 当前查找方向 extends 查找方向, 查找结果 extends 落子信息[] = []> = 下一次查找位置<
  最后一次落子[1],
  当前查找方向[0]
> extends 横点
  ? 下一次查找位置<最后一次落子[2], 当前查找方向[1]> extends 纵点
    ? 查找当前落子<
        落子集合,
        [最后一次落子[0], 下一次查找位置<最后一次落子[1], 当前查找方向[0]>, 下一次查找位置<最后一次落子[2], 当前查找方向[1]>]
      > extends 落子信息
      ? 查找连续落子<
          落子集合,
          [最后一次落子[0], 下一次查找位置<最后一次落子[1], 当前查找方向[0]>, 下一次查找位置<最后一次落子[2], 当前查找方向[1]>],
          当前查找方向,
          [...查找结果, [最后一次落子[0], 下一次查找位置<最后一次落子[1], 当前查找方向[0]>, 下一次查找位置<最后一次落子[2], 当前查找方向[1]>]]
        >
      : 查找结果
    : 查找结果
  : 查找结果;
// test
// type 测试查找连续落子左连 = 查找连续落子<
//   [["⚫", "01", "01"], ["⚫", "02", "01"], ["⚫", "04", "01"], ["⚫", "05", "01"]],
//   ["⚫", "03", "01"],
//   [-1, 0]
// >;
// type 测试查找连续落子右连 = 查找连续落子<
//   [["⚫", "01", "01"], ["⚫", "02", "01"], ["⚫", "04", "01"], ["⚫", "05", "01"]],
//   ["⚫", "03", "01"],
//   [1, 0]
// >;

// 横连：向左查找【横点递减并纵点相同】的棋子 和 向右查找【横点递增并纵点相同】的棋子。
type 横连胜利<落子集合 extends 落子信息[], 最后一次落子 extends 落子信息> = [
  ...查找连续落子<落子集合, 最后一次落子, [-1, 0]>,
  最后一次落子,
  ...查找连续落子<落子集合, 最后一次落子, [1, 0]>
];

// 纵连：向上查找【纵点递减并横点相同】的棋子 和 向下查找【纵点递增并横点相同】的棋子。
type 纵连胜利<落子集合 extends 落子信息[], 最后一次落子 extends 落子信息> = [
  ...查找连续落子<落子集合, 最后一次落子, [0, -1]>,
  最后一次落子,
  ...查找连续落子<落子集合, 最后一次落子, [0, 1]>
];

// 左斜连：向左下查找【横点递减同时纵点递增】的棋子 和 向右上查找【横点递增同时纵点递减】的棋子。
type 左斜连胜利<落子集合 extends 落子信息[], 最后一次落子 extends 落子信息> = [
  ...查找连续落子<落子集合, 最后一次落子, [-1, 1]>,
  最后一次落子,
  ...查找连续落子<落子集合, 最后一次落子, [1, -1]>
];

// 右斜连：向左上查找【横点递减同时纵点递减】的棋子 和 向右下查找【横点递增同时纵点递增】的棋子。
type 右斜连胜利<落子集合 extends 落子信息[], 最后一次落子 extends 落子信息> = [
  ...查找连续落子<落子集合, 最后一次落子, [-1, -1]>,
  最后一次落子,
  ...查找连续落子<落子集合, 最后一次落子, [1, 1]>
];

// 其中一个方向为五个则胜利
type 判断胜利<落子集合 extends 落子信息[], 最后一次落子 extends 落子信息 | []> = 最后一次落子 extends 落子信息
  ? 横连胜利<落子集合, 最后一次落子>["length"] extends 5
    ? `对局结束【${最后一次落子[0]}】✌🏻✌🏻✌🏻`
    : 纵连胜利<落子集合, 最后一次落子>["length"] extends 5
    ? `对局结束【${最后一次落子[0]}】✌🏻✌🏻✌🏻`
    : 左斜连胜利<落子集合, 最后一次落子>["length"] extends 5
    ? `对局结束【${最后一次落子[0]}】✌🏻✌🏻✌🏻`
    : 右斜连胜利<落子集合, 最后一次落子>["length"] extends 5
    ? `对局结束【${最后一次落子[0]}】✌🏻✌🏻✌🏻`
    : "进行中"
  : "未开始";
// test
// type 测试横连胜利 = 判断胜利<
//   [
//     ["⚫", "01", "01"],
//     ["⚫", "02", "01"],
//     ["⚫", "04", "01"],
//     ["⚫", "05", "01"],
//     ["⚫", "06", "02"] // 不连
//   ],
//   ["⚫", "03", "01"]
// >;

// type 测试纵连胜利 = 判断胜利<
//   [
//     ["⚫", "01", "01"],
//     ["⚫", "01", "02"],
//     ["⚫", "01", "04"],
//     ["⚫", "01", "05"],
//     ["⚫", "02", "06"] // 不连
//   ],
//   ["⚫", "01", "03"]
// >;

// type 测试左斜连胜利 = 判断胜利<
//   [
//     ["⚫", "06", "04"],
//     ["⚫", "05", "05"],
//     ["⚫", "09", "01"],
//     ["⚫", "08", "02"],
//     ["⚫", "04", "04"] // 不连
//   ],
//   ["⚫", "07", "03"]
// >;

// type 测试右斜连胜利 = 判断胜利<
//   [
//     ["⚫", "04", "04"],
//     ["⚫", "05", "05"],
//     ["⚫", "01", "01"],
//     ["⚫", "02", "02"],
//     ["⚫", "06", "05"] // 不连
//   ],
//   ["⚫", "03", "03"]
// >;

/**
 * @desc 五、处理棋盘
 */
type 最后落子<落子集合 extends 落子信息[]> = 落子集合 extends [...infer _剩余落子, infer _最后落子] ? _最后落子 : [];

type 转换棋盘<横点集合 extends string[]> = 横点集合 extends [infer _当前横点 extends string, ...infer _剩余横点 extends string[]]
  ? `${_当前横点}|${转换棋盘<_剩余横点>}`
  : "";

type 渲染棋盘<当前棋盘 extends Record<string, string[]>> = {
  [_纵点 in keyof 当前棋盘]: 转换棋盘<当前棋盘[_纵点]>;
};

/**
 * @desc 六、开始对局
 */
// =============== 这是一个例子 =============================
// ========================================================
// const 落子集合 = 交替落子
//   .落子("⚫", "01-01")
//   .落子("⚪", "01-02")
//   .落子("⚫", "02-02")
//   .落子("⚪", "01-03")
//   .落子("⚫", "03-03")
//   .落子("⚪", "01-04")
//   .落子("⚫", "04-04")
//   .落子("⚪", "01-05")
//   .落子("⚫", "05-05");

// =============== 开始新的对局 =============================
// ========================================================
const 落子集合 = 交替落子.落子("⚫", "01-02");

type 落子结果 = (typeof 落子集合)["落子结果"];
type 棋盘状态 = 渲染棋盘<更新棋盘<棋盘, 落子结果>>;
type 对局状态 = 判断胜利<落子结果, 最后落子<落子结果>>;
