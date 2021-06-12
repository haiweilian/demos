// 表示在 extends 条件语句中待推断的类型变量。
type ParamType<T> = T extends (...args: infer P) => any ? P : T;

interface User {
  name: string;
  age: number;
}

type Func = (user: User) => void;

type Param = ParamType<Func>;

type Params = ParamType<string>;

// 待返回的返回值的类型
type ReturnTypeMy<T> = T extends (...args: any[]) => infer P ? P : any;
type FuncMy = (user: any) => User;

type ReturnMy = ReturnTypeMy<FuncMy>;
