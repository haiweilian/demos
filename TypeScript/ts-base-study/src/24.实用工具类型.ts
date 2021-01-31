// ====== 提供一些工具类型来帮助常见的类型转换。这些类型是全局可见的。
// ====== 一些常用的声明，所有的工具类可以点进去看怎么实现的

// --Partial<T>：构造类型`T`，并将它所有的属性设置为可选的。它的返回类型表示输入类型的所有子类型。
interface Todo {
  title: string;
  description: string;
}

let todo: Partial<Todo> = {
  title: "title",
};

// --Readonly<T> 构造类型`T`，并将它所有的属性设置为`readonly`，也就是说构造出的类型的属性不能被再次赋值。
let todo1: Readonly<Todo> = {
  title: "title",
  description: "",
};

// todo1.title = "11";

// .....
