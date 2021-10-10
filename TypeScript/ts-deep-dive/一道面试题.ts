export type name = "一道面试题";

interface Action<T> {
  payload?: T;
  type: string;
}

class EffectModule {
  count = 1;
  message = "hello!";

  delay(input: Promise<number>) {
    return input.then((i) => ({
      payload: `hello ${i}!`,
      type: "delay",
    }));
  }

  setMessage(action: Action<Date>) {
    return {
      payload: action.payload!.getMilliseconds(),
      type: "set-message",
    };
  }
}

// 修改 Connect 的类型，让 connected 的类型变成预期的类型
// 提取函数类型
type FuncName<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

// 使用条件类型和 infer
type Connect = (module: EffectModule) => {
  [K in FuncName<EffectModule>]: EffectModule[K] extends (input: Promise<infer P1>) => Promise<Action<infer P2>>
    ? (input: P1) => Action<P2>
    : EffectModule[K] extends (action: Action<infer P3>) => Action<infer P4>
    ? (action: P3) => Action<P4>
    : never;
};

const connect: Connect = (m) => ({
  delay: (input: number) => ({
    type: "delay",
    payload: `hello 2`,
  }),
  setMessage: (input: Date) => ({
    type: "set-message",
    payload: input.getMilliseconds(),
  }),
});

type Connected = {
  delay(input: number): Action<string>;
  setMessage(action: Date): Action<number>;
};

export const connected: Connected = connect(new EffectModule());
