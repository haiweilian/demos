// ============= Test Cases =============
import type { Equal, Expect } from "./test-utils";

type cases = [
  Expect<
    Equal<
      Camelize<{
        some_prop: string;
        prop: { another_prop: string };
        array: [
          { snake_case: string },
          { another_element: { yet_another_prop: string } },
          { yet_another_element: string }
        ];
      }>,
      {
        someProp: string;
        prop: { anotherProp: string };
        array: [
          { snakeCase: string },
          { anotherElement: { yetAnotherProp: string } },
          { yetAnotherElement: string }
        ];
      }
    >
  >
];

// ============= Your Code Here =============
type CamelizeKey<T extends string> = T extends `${infer Left}_${infer Rest}`
  ? `${Left}${CamelizeKey<Capitalize<Rest>>}`
  : T;

type CamelizeArr<T extends Record<string, any>[]> = T extends [
  infer First extends Record<string, any>,
  ...infer Rest extends Record<string, any>[]
]
  ? [Camelize<First>, ...CamelizeArr<Rest>]
  : [];

type Camelize<T extends Record<string, any>> = {
  [K in keyof T as CamelizeKey<K & string>]: T[K] extends unknown[]
    ? CamelizeArr<T[K]>
    : T[K] extends {}
    ? Camelize<T[K]>
    : T[K];
};
