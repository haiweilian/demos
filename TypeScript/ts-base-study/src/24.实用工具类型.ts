// ====== 提供一些工具类型来帮助常见的类型转换。这些类型是全局可见的。
// ====== 一些常用的声明，所有的工具类可以点进去看怎么实现的

// --Partial<T>：构造类型`T`，并将它所有的属性设置为可选的。它的返回类型表示输入类型的所有子类型。
// --Readonly<T> 构造类型`T`，并将它所有的属性设置为`readonly`，也就是说构造出的类型的属性不能被再次赋值。
// --Required<T> 构造一个类型，使类型T的所有属性为required
interface Todo {
  title: string;
  description: string;
}

let todo: Partial<Todo> = {
  title: "title",
};

let todo1: Readonly<Todo> = {
  title: "title",
  description: "",
};

let todo11: Required<Todo> = {
  title: "title",
  description: "",
};

// todo1.title = "11";

// --Record<K,T> 构造一个类型，其属性名的类型为K，属性值的类型为T。这个工具可用来将某个类型的属性映射到另一个类型上。
interface PageInfo {
  title: string;
}

type Page = "home" | "about" | "contact";

// page 作为 key  PageInfo 作为 value 的格式
let todo2: Record<Page, PageInfo> = {
  home: { title: "1" },
  about: { title: "1" },
  contact: { title: "1" },
};

// -- Pick<T,K> 从类型T中挑选部分属性K来构造类型。
// -- Omit<T,K> 从类型T中获取所有属性，然后从中剔除K属性后构造一个类型。
interface Todo2 {
  title: string;
  description: string;
  completed: boolean;
}

type TodoPreview = Pick<Todo2, "title" | "description">;
type TodoPreview2 = Omit<Todo2, "completed">;

let todoPreview: TodoPreview = {
  title: "1",
  description: "1",
};
let todoPreview2: TodoPreview2 = {
  title: "1",
  description: "1",
};

// -- Exclude<T,U> 从类型T中剔除所有可以赋值给U的属性，然后构造一个类型
// -- Extract<T,U> 从类型T中提取所有可以赋值给U的类型，然后构造一个类型。

type Todo3 = Exclude<"a" | "b" | "c", "a">; // "b" | "c"
type Todo4 = Extract<"a" | "b" | "c", "a">; // "a"

let todo3: Todo3 = "b";
todo3 = "c";
let todo4: Todo4 = "a";

// -- NonNullable<T> 从类型T中剔除null和undefined，然后构造一个类型。

type Todo5 = NonNullable<string | null | undefined>;

let todo5 = "1";
// todo5 = null;

// -- ThisType<T> 这个工具不会返回一个转换后的类型。它做为上下文的this类型的一个标记。注意，若想使用此类型，必须启用--noImplicitThis。

class Todo6 {
  name: number;
  constructor() {
    this.name = 1;
  }
}

let extendsTodo6: ThisType<Todo6> = {
  some() {
    this.name = 2;
  },
};
