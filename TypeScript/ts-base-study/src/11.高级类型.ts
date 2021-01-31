// ====== 交叉类型（Intersection Types）
// --交叉类型取多个类型的【并集】,  同时拥有了这几种类型的成员
interface PersonIntersection {
  name: string;
}
interface LoggableIntersection {
  log(name: string): void;
}

type PersonLoggableIntersection = PersonIntersection & LoggableIntersection;

let personLoggableIntersection: PersonLoggableIntersection = {
  name: "1",
  log(name) {
    console.log(name);
  },
};

// ====== 联合类型（Union Types）
// --联合类型表示一个值可以是几种类型之一
// --用竖线（`|`）分隔每个类型，就可以是这几种类型之一
type paddingUnionFace = number | string | boolean;
let paddingUnion: paddingUnionFace;
paddingUnion = 1;
paddingUnion = "1";
paddingUnion = true;

// --如果一个值是联合类型(对象)，那么只能访问此联合类型的公用部分
// 如果一个值的类型是`A | B`，我们能够_确定_的是它包含了`A`_和_`B`中共有的成员。 这个例子里，`Bird`具有一个`fly`成员。 我们不能确定一个`Bird | Fish`类型的变量是否有`fly`方法。 如果变量在运行时是`Fish`类型，那么调用`pet.fly()`就出错了。
interface Bird {
  fly(): void;
  layEggs(): void;
}
interface Fish {
  swim(): void;
  layEggs(): void;
}

function getSmallPet(): Fish | Bird {
  return {
    fly() {},
    swim() {},
    layEggs() {},
  };
}

let pet = getSmallPet();
pet.layEggs();
// pet.swim();

// ====== 类型守卫与类型区分（Type Guards and Differentiating Types）
// --因为无法访问非公共成员，如果要访问必须使用类型断言
// if ((pet as Fish).swim) {
//   (pet as Fish).swim();
// } else {
//   (pet as Bird).fly();
// }

// ====== 用户自定义的类型守卫-使用类型判定
// `pet is Fish`就是类型谓词。 谓词为`parameterName is Type`这种形式
// --通过这个类型守卫可以明确的知道，if 里面是 Fish，else 里面是 Bird
function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}

if (isFish(pet)) {
  pet.swim();
} else {
  pet.fly();
}

// ====== 用户自定义的类型守卫-使用 in 操作符
// --使用 in 来判断哪个类型
if ("swim" in pet) {
  pet.swim();
} else {
  pet.fly();
}

// ====== 类型守卫和类型断言
// --- 使用 ! 去除 null
function fixed(name: string | null | undefined): string {
  function postfix(epithet: string) {
    return name!.charAt(0) + ".  the " + epithet; // ok
  }
  name = name || "Bob";
  return postfix("great");
}

// ====== 类型别名
// --类型别名会给一个类型起个新名字
// --如果你无法通过接口来描述一个类型并且需要使用联合类型或元组类型，这时通常会使用类型别名。
type Name = string;
type NameResolver = () => string;
type NameOrResolver = Name | NameResolver;
function getName(n: NameOrResolver): Name {
  if (typeof n === "string") {
    return n;
  } else {
    return n();
  }
}
getName("1");
getName(() => "1");

// ====== 索引类型
interface Cars {
  manufacturer: string;
  model: string;
  year: number;
}

let taxi: Cars = {
  manufacturer: "Toyota",
  model: "Camry",
  year: 2014,
};

// --索引类型查询操作符
// --首先是`keyof T`，**索引类型查询操作符**。 对于任何类型`T`，`keyof T`的结果为`T`上已知的公共属性名的联合。
// --**索引访问操作符 T[K] **
// function pluck<Cars, "manufacturer" | "model">(o: Cars, propertyNames: ("manufacturer" | "model")[]): string[]
type Test01 = keyof Cars; //  type Test01 = "manufacturer" | "model" | "year"
function pluck<T, K extends keyof T>(o: T, propertyNames: K[]): T[K][] {
  return propertyNames.map((n) => o[n]);
}
let makeAndModel: string[] = pluck(taxi, ["manufacturer", "model"]);

// ====== 映射类型
// --从旧类型中创建新类型的一种方式 — **映射类型**。
interface PersonDefault {
  name: string;
  age: number;
}

// --将每个属性变为可读
// --> keyof T 所有属性的联合类型
// --> P in 相当于 for ... in 遍历 [keyof T]，每一项都加上 可选标识 ?
// --> T[P]  索引访问操作符, 属性 P 所指定的类型
type MyPartial<T> = {
  [P in keyof T]?: T[P];
};
// interface PersonPartial {
//   name?: string;
//   age?: number;
// }

// --原理同上
type MyReadonly<T> = {
  readonly [P in keyof T]: T[P];
};
// interface PersonReadonly {
//   readonly name: string;
//   readonly age: number;
// }

// ====== 条件类型
// 语法： T extends U ? X : Y
// 解释：上面的类型意思是，若`T`能够赋值给`U`，那么类型是`X`，否则为`Y`。
type TypeName<T> = T extends string
  ? "string"
  : T extends number
  ? "number"
  : T extends boolean
  ? "boolean"
  : T extends undefined
  ? "undefined"
  : T extends Function
  ? "function"
  : "object";

type T0 = TypeName<number>; // number
type T1 = TypeName<string>; // string
type T2 = TypeName<Function>; // function
type T3 = TypeName<string[]>; // object

// -- 分布式有条件类型在实例化时会自动分发成联合类型
// -- 会被拆解成
// -- (string extends U ? X : Y) | (number extends U ? X : Y)
type T4 = TypeName<string | number>; // string | number

// -- 使用分布式条件类型做类型过滤
// --从类型`T`中剔除所有可以赋值给`U`的属性，然后构造一个类型。
type MyExclude<T, U> = T extends U ? never : T;

type T8 = MyExclude<"a" | "b" | "c", "b">; // a | b

// --从类型`T`中提取所有可以赋值给`U`的类型，然后构造一个类型。
type MyExtract<T, U> = T extends U ? T : never;

type T9 = MyExtract<"a" | "b" | "c", "b">; // b
