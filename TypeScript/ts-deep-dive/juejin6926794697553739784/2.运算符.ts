/**
 * @非空断言运算符 !
 */
function onClick(callback?: () => void) {
  callback!();
}

/**
 * @可选链运算符 ?.
 */
function onClick1(a?: { value: "" }) {
  // a.value;
  a?.value;
  // a && a.value;
  // a === null || a === void 0 ? void 0 : a.value;
}

/**
 * @空值合并运算符 ??
 */
function onClick2(a?: { value: "" }) {
  let b = a ?? {}; // 只判断了 null 和 undefind 而不是全部的 Falsey 值
  // let b = a !== null || a !== void 0 ? a : {};
}

/**
 * @数字分隔符_
 */
// 任意用 _ 分割，便于阅读
let num: number = 1_111_111_111.111_111_1;
