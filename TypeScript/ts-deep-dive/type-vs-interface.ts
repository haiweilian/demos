// 因为[软件中的对象应该对于扩展是开放的，但是对于修改是封闭的](https://en.wikipedia.org/wiki/Open/closed_principle)，你应该尽量去使用接口代替类型别名。
// 另一方面，如果你无法通过接口来描述一个类型并且需要使用联合类型或元组类型，这时通常会使用类型别名。

/**
 * 定义接口，
 * 定义/扩展数据描述信息，应尽量使用 interface
 */
interface IDog {
  kg: number;
}
type TDog = {
  kg: number;
};

/**
 * 扩展
 */
interface IDogExt extends IDog {
  color: "white";
}
type TDogExt = TDog & { color: "white" };

/**
 * 函数
 */
interface IDogFn {
  (n: number): void;
}
type TDogFn = (n: number) => void;
let fni: IDogFn = (n: number) => {};
let fnt: TDogFn = (n: number) => {};

/**
 * 定义一个类型的别名
 */
type tuple = [string, number];
type list = Array<number | string>;
