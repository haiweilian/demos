export type name = "vue-ref";

/**
 * @泛型的反向推导
 */
// 明确的传入了一个 number 的泛型
type Value<T> = T;
type NumberValue = Value<number>;

// 在调用 create(1); 并没有传入泛型可以正确推导出 number
// 实际上三者关联为 function create<1>(val: 1): 1
declare function create<T>(val: T): T;
let num: number = 1;
let c = create(1);

/**
 * @实现
 */
// 定义 ref
type Ref<T = any> = {
  value: T;
};

// 如果是对象
type UnwrapRefSimple<T> = T extends object
  ? {
      [P in keyof T]: UnwarpRef<T[P]>;
    }
  : T;

// 解包 ref 返回类型
type UnwarpRef<T> = T extends Ref<infer R> ? UnwrapRefSimple<R> : UnwrapRefSimple<T>;
type un1 = UnwarpRef<number>; // type un1 = number
type un2 = UnwarpRef<Ref<number>>; // type un2 = number
type un3 = UnwarpRef<Ref<Ref<Ref<Ref<number>>>>>; // type un3 = number

declare function ref<T>(value: T): Ref<UnwarpRef<T>>;

const count = ref(1);
let co = count.value;

const obj = ref({
  a: ref({
    d: ref("1"),
  }),
  b: ref(1),
});

let ob = obj.value.a.d;
