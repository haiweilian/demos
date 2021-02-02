// 1、umdLib 是一个函数
declare function umdLib(options: umdLib.Options): void;

// 2、umdLib 上有一些方法和属性
declare namespace umdLib {
  const version: string;
  function doSomething(): void;
  // 定义在命名空间下，防止和同名合并
  interface Options {
    [index: string]: any;
  }
}

// export default umdLib;
// 为了支持CommonJS和AMD的`exports`, TypeScript提供了`export =`语法。
export = umdLib;
