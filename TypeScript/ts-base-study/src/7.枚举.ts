// ====== 数字枚举
// --默认值从 0 开始索引
enum Direction {
  Up,
  Down,
  Left,
  Right,
}
console.log(Direction.Up, Direction.Down, Direction.Left, Direction.Right); // 0 1 2 3
// --如果指定初始值，那么后续会自动增长
enum Direction1 {
  Up = 1,
  Down,
  Left = 4,
  Right,
}
console.log(Direction1.Up, Direction1.Down, Direction1.Left, Direction1.Right); // 1 2 4 5

// ====== 字符串枚举
// 字符串枚举没有自增长的行为
enum Direction2 {
  Up = "Up",
  Down = "Down",
  Left = "Left",
  // Right, // Enum member must have initializer.
}
console.log(Direction2.Up, Direction2.Down, Direction2.Left); // Up Down Left

// ====== 异构枚举
// 多种类型，虽然可以这么做，但不建议
enum Direction3 {
  No = 0,
  Yes = "Yes",
}

// ====== 编译时的枚举
enum LogLevel {
  ERROR,
  WARN,
  INFO,
  DEBUG,
}

// 等同于 type LogLevelStrings = "ERROR" | "WARN" | "INFO" | "DEBUG"
type LogLevelStrings = keyof typeof LogLevel;

function printImportant(key: LogLevelStrings, message: string) {
  const num = LogLevel[key];
  return num;
}

printImportant("DEBUG", "This is a message");
// printImportant("CONSOLE", "This is a message");  // Error

// ====== 反向映射
// play https://www.typescriptlang.org/zh/play
// --从编译结果看
enum Enum {
  A,
  B = "B",
}

// --以上枚举会被编译成
// "use strict";
// var Enum;
// (function (Enum) {
//     Enum[Enum["A"] = 0] = "A";
//     Enum["B"] = "B";
// })(Enum || (Enum = {}));

let a = Enum.A; // 0
let nameOfA = Enum[a]; // "A"

// ====== `const`枚举
// --在使用常量枚举的时候会删除枚举，因为常量枚举不允许包含计算成员
const enum Directions {
  Up,
  Down,
  Left,
  Right,
}

let directions = [Directions.Up, Directions.Down, Directions.Left, Directions.Right];

// --以上枚举会被编译成
// "use strict";
// let directions = [0 /* Up */, 1 /* Down */, 2 /* Left */, 3 /* Right */];
