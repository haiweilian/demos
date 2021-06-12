/**
 * @unknown
 */
function test(input: unknown) {
  // 使用的再判断类型，根据判断转换为任意类型
  if (Array.isArray(input)) {
    return input.length;
  }
  return input;
}

/**
 * @void
 */
// 没有返回值的时候，应为 void 不应该使用 undefined(可以被重写)
function test1(input: number): void {}
