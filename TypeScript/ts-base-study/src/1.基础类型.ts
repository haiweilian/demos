// ====== 类型
let isDone: boolean = true; // [Boolean]
let decLiteral: number = 1; // [Number]
let bigLiteral: bigint = 100n; // [Number]
let nameString: string = "1"; // [String]
let nameSymbol: symbol = Symbol(); // [Symbol]
let nameObject: object = {}; // [Object]

// ====== 数组 [Array]
let list: number[] = [1, 2, 3];
// --只能是同一种值
// let list1: number[] = [1, 2, 3, "4"]; // Error
// --多种值使用数组泛型 `Array<元素类型>`
let list2: Array<number | string> = [1, 2, 3, "4"];

// ====== 元组 [Tuple]
// --元组限制已知的元素数量和类型
let tuple: [string, number];
tuple = ["hello", 1];
// --类型不对应
// tuple = [1, "hello"]; // Error
// --数组越界
// tuple[2]; // Error

// ====== [Unknown]
// --未知类型的变量可以被赋值任意类型的值
let notSure: unknown = 1;
notSure = "11";
notSure = true;
// --当使用的时候必须使用一些方法限定其类型，如 判断、注释
// let aBoolean: boolean = notSure; // Error
if (typeof notSure === "boolean") {
  let aBoolean: boolean = notSure;
}
if (typeof notSure === "string") {
  let aString: string = notSure;
}

// ====== [Any]
// --Any类型的变量可以被赋值任意类型的值
let notSureAny: any = 1;
notSureAny = "11";
notSureAny = true;
// --并且没有后续的限制
let aBoolean: boolean = notSureAny;

// ====== [Void]
// --Void类型表示没有任何类型，如：函数没有返回值、或直接赋值 undefined
let unusable: void = undefined;
let isVoid = function (): void {
  // return 1; // Error
};

// ====== [Null] 、[Undefined]
// --strictNullChecks 开启情况下只能赋值自己对应的类型，反之可以赋值任意类型。
let istNull: null = null;
let istUndefined: undefined = undefined;
let istNumber: number = 1;
// --strictNullChecks 关闭
// istNumber = null;
// istNumber = undefined;

// ====== [Never]
// --那些永不存在的值的类型、如抛出错误、或永远不会有返回值
let error = (): never => {
  throw new Error("error");
};
let endless = (): never => {
  while (true) {}
};

// ====== 类型断言
// --自己很清楚应该使用哪个类型的时候，强制指定.
// --尖括号
let someValue: any = "this is a string";
let strLength1: number = (<string>someValue).length;
let strLength2: number = (someValue as string).length;
