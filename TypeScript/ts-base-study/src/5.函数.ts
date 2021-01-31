// ====== 函数定义
type type1 = (x: number, y: number) => number;
interface type2 {
  (x: number, y: number): number;
}

function add1(x: number, y: number): number {
  return x + y;
}

let add2: type1 = function add2(x, y) {
  return x + y;
};
add2(1, 2);

let add3: type2 = function add2(x, y) {
  return x + y;
};
add3(1, 2);

// ====== 可选参数
function add4(x: number, y?: number): number {
  return y ? x + y : x;
}
add4(1);

// ====== 默认参数
function add5(x: number, y: number, z: number = 10): number {
  return x + y + z;
}
add5(1, 2);

// ====== 剩余参数
function add6(x: number, ...rest: number[]): number {
  return x + rest.reduce((acc, cur) => acc + cur);
}
add6(1, 2, 3, 4, 5, 6);

// ====== 重载
// --实现方案，先定义类型参数，最后定义一个泛类型在实现它们
function add8(x: number, y: number): number;
function add8(x: string, y: string): string;
function add8(x: any, y: any) {
  if (typeof x === "number" && typeof y === "number") {
    return x + y;
  }
  if (typeof x === "string" && typeof y === "string") {
    return x + y;
  }
}
add8(1, 1);
add8("1", "1");
// add8(1, "1");
