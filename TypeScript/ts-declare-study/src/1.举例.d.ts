// ====== 全局变量
declare var foo: number;

// ====== 全局函数
declare function greet(params: string): void;

// ====== 带属性的对象
declare namespace myLib {
  function name(params: string): void;
  let number: number;
}

// ====== 可重用类型（接口）
interface GreetingSettings {
  greeting: string;
  duration?: number;
  color?: string;
}

declare function greets(params: GreetingSettings): void;
