// 1、moduleLib 是一个函数
declare function moduleLib(options: moduleLib.Options): void;

// 2、moduleLib 上有一些方法和属性
declare namespace moduleLib {
  const version: string;
  function doSomething(): void;
  // 定义在命名空间下，防止和同名合并
  interface Options {
    [index: string]: any;
  }
}

export default moduleLib;
