// ====== 合并接口
// --多次声明同名的接口，会放在一起
interface Box {
  height: number;
  width: number;
}

let box: Box = {
  height: 1,
  width: 1,
  scale: 1,
};

// ====== 合并命名空间
// --多次声明同名的命名空间，会放在一起
namespace Animals {
  export class Zebra {}
}
namespace Animals {
  export class Dog {}
}
// namespace Animals {
//   export class Zebra {}
//   export class Dog {}
// }
