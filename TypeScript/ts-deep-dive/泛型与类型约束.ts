// ===== 泛型与类型约束
/**
 * ====== 泛型
 * @var 把泛型函数看成另一个维度的函数
 * 1、函数维度：传入一个 x，返回一个 x，x 是什么调用时决定的。
 * 2、泛型维度：传入一个 T 类型，返回一个 T 类型，T 类型是什么调用时决定的。
 */
// @普通函数
// function add(x) {
//   return x;
// }
//
// @泛型函数
function add<T>(x: T): T {
  return x;
}

add<number>(1); // function add<number>(x: number): number
add<string>("1"); // function add<string>(x: string): string
add<boolean>(false); // function add<boolean>(x: boolean): boolean

/**
 * ====== 泛型类型约束
 * @var 对泛型约束类型范围
 */
interface Lengthwise {
  length: number;
}

// function getLength<T>(data: T): number {
//   // 比如要获取 length，不能保证类型上有 length 属性
//   return data.length;
// }
// 这里使用 extends 关键字约束类型，
// 可以理解传入的 T 类型必须是 Lengthwise 的子类型。[子类型、逆变、协变]
function getLength<T extends Lengthwise>(data: T): number {
  return data.length;
}

// getLength({});
getLength({ length: 1 });
getLength([]);
getLength("");
