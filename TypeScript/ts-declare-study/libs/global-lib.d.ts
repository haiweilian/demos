// 1、globalLib 是一个函数
declare function globalLib(options: globalLib.Options): void;

// 2、globalLib 上有一些方法和属性
declare namespace globalLib {
  const version: string;
  function doSomething(): void;
  // 定义在命名空间下，防止和同名合并
  interface Options {
    [index: string]: any;
  }
}
