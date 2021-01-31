// ====== 泛型基础
// --一个普通的函数定义
function identity(arg: number): number {
  return arg;
}

// --定义一个泛型函数
// --把泛型函数看成另一个维度的函数
function identityGenerics<T>(arg: T): T {
  return arg;
}
// --它的类型是调用的时候传入的,(对应 <T> ，这样看是不是和函数的参数差不多一样的)
identityGenerics<string>("1");
identityGenerics<number>(1);

// ====== 泛型类型
interface GenericIdentityFn<T> {
  (arg: T): T;
}
type GenericIdentityFnTwo<T> = (arg: T) => T;

let myIdentity: GenericIdentityFn<number> = identityGenerics;
let myIdentityTwo: GenericIdentityFnTwo<number> = identityGenerics;

// ====== 泛型类
// ! = https://blog.csdn.net/qq_41261490/article/details/102605640
class GenericNumber<T> {
  zeroValue!: T;
  add!: (x: T, y: T) => T;
}

let myGenericNumber = new GenericNumber<number>();
myGenericNumber.zeroValue = 0;
myGenericNumber.add = function (x, y) {
  return x + y;
};

// ====== 泛型约束
// --描述泛型的条件
interface Lengthwise {
  length: number;
}

// --这样泛型就被约束成了，必须包含 length 接口
function loggingIdentity<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}

// loggingIdentity(1); 不包含 length 属性
loggingIdentity<{ length: number }>({ length: 1 });
loggingIdentity<[]>([]);
loggingIdentity<string>("");

// ====== 在泛型约束中使用类型参数
// --一个类型参数，且它被另一个类型参数所约束
function getProperty<T, K extends keyof T>(obj: T, key: K) {
  return obj[key];
}
let objProperty = { a: 1, b: 2 };
getProperty(objProperty, "a");
getProperty(objProperty, "b");
// getProperty(objProperty, "c"); // Error
