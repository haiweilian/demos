/**
 * @基本使用
 */
function swipe<T, U>(value: [T, U]): [U, T] {
  return [value[1], value[0]];
}

// 把泛型参数，看出另一个维度的参数
swipe<number, number>([1, 2]);
