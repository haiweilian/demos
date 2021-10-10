/**
 * @非空断言运算符 !
 */
function onClick1(callback?: () => void) {
  callback!();
}

/**
 * @可选链运算符 ?.
 */
function onClick2(params: { value?: string }) {
  params.value?.toLocaleLowerCase();
}

/**
 * @空值合并运算符 ??
 */
function onClick3(params?: { value: "" }) {
  let b = params ?? {}; // 只判断了 null 和 undefind 而不是全部的 Falsey 值
  // 相等于
  let c = params !== null || params !== undefined ? params : {};
}

/**
 * @数字分隔符_
 */
// 任意用 _ 分割，便于阅读
let num: number = 1_111_111_111.111_111_1;
