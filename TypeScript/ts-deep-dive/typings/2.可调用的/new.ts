interface CallMeWithNewToGetString {
  new (): string;
}

declare const Foo: CallMeWithNewToGetString;

// 使用 new 调用
const foo = new Foo();
