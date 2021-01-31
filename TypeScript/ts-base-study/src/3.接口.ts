// ====== 接口定义
// --在对象上直接声明类型
function printLabel(obj: { label: string }) {
  console.log(obj.label);
}
let objLabel = { size: 10, label: "Size 10 Object" };
printLabel(objLabel);

// --这时候的接口，就像是一个名字，用来描述类型
interface LabeledValue {
  label: string;
}
function printLabelFace(obj: LabeledValue) {
  console.log(obj.label);
}
let objLabelFace = { size: 10, label: "Size 10 Object" };
printLabelFace(objLabelFace);

// ====== 可选属性
// --使用 ? 表示可选属性
interface SquareConfig {
  color?: string;
  width?: number;
}
function createSquare(obj: SquareConfig): number {
  if (obj.width) {
    return obj.width * 2;
  } else {
    return 0;
  }
}
createSquare({ width: 10 });

// ====== 只读属性
interface Point {
  x: number;
  readonly y: number;
}

let point: Point = { x: 1, y: 1 };
point.x = 2;
// point.y = 2; // Error

// ====== 函数类型
// -- 需要一个只有参数列表和返回值类型
interface SearchFunc {
  (source: string, subString: string): boolean;
}
let mySearch: SearchFunc = function (src: string, sub: string) {
  return src.search(sub) > -1;
};
mySearch("hello", "he");

// ====== 可索引的类型
// --那些能够“通过索引得到”的类型
interface StringArray {
  [index: number]: string;
}
let myArray: StringArray = ["Bob", "Fred"];
// --字符串索引类型时，返回值的类型需要与索引类型的返回值匹配
interface NumberOrStringDictionary {
  [index: string]: number | string;
  length: number;
  name: string;
}

// ====== 实现接口
// --定义一个接口，明确的强制一个类去符合某种契约
interface ClockInterface {
  currentDate: Date;
  setTime(d: Date): void;
}
// -- 使用 implements 实现接口。
class Clock implements ClockInterface {
  currentDate: Date = new Date();
  constructor(d: Date) {
    this.currentDate = d;
  }
  setTime(d: Date) {
    this.currentDate = d;
  }
}
let clock = new Clock(new Date());
clock.setTime(new Date());

// ====== 继承接口
// --和类一样，接口也可以相互继承，并且可以多继承
interface SquareColor {
  color: string;
}

interface SquareWidth {
  width: number;
}

interface Square extends SquareColor, SquareWidth {
  height: number;
}

let square = {} as Square;
square.color = "color";
square.width = 100;
square.height = 100;

// ====== 混合类型
// --一个对象可以作为函数和对象使用。表示是一个函数，并且有其他属性
interface Counter {
  (start: number): number;
  interval: number;
  reset(): void;
}

function getCounter(): Counter {
  let counter = function (start: number) {
    console.log(start);
  } as Counter;
  counter.interval = 11.2;
  counter.reset = function () {};
  return counter;
}

let c = getCounter();
c(100);
c.interval = 1;
c.reset();

// ====== 接口继承类
class Control {
  // private state: any; // 打开 Images 会报错的。
}

interface SelectableControl extends Control {
  select(): void;
}

// -- 因为 SelectableControl 继承的类包含私有成员，所以只能 Control 的子类才能实现
class Button extends Control implements SelectableControl {
  select() {}
}

class Images implements SelectableControl {
  select() {}
}
