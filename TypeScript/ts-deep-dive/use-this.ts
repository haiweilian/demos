// 如果这个方法显式指定了 this 参数，那么 this 具有该参数的类型。
let foo = {
  x: "hello",
  f(this: { message: string }, n: number) {
    this; // { message: string }
  },
};

// 否则，如果方法由带 this 参数的签名进行上下文键入，那么 this 具有该参数的类型。
let foos = {
  x: "hello",
  f(n: number) {
    this; // { x: string, f(n: number): void }
  },
};

// 选项已经启用，并且对象字面量中包含由 ThisType<T> 键入的上下文类型，那么 this 的类型为 T
let fooss: ThisType<{ message: string }> = {
  x: "hello",
  f(n: number) {
    this; // { message: string }
  },
};
