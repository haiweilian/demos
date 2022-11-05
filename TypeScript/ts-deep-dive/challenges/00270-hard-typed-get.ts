// ============= Test Cases =============
import type { Equal, Expect } from "./test-utils";

type cases = [
  Expect<Equal<Get<Data, "hello">, "world">>,
  Expect<Equal<Get<Data, "foo.bar.count">, 6>>,
  Expect<Equal<Get<Data, "foo.bar">, { value: "foobar"; count: 6 }>>,
  Expect<Equal<Get<Data, "no.existed">, never>>
];

type Data = {
  foo: {
    bar: {
      value: "foobar";
      count: 6;
    };
    included: true;
  };
  hello: "world";
};

// ============= Your Code Here =============
type Get<T, K extends string> = K extends `${infer Item}.${infer Rest}`
  ? Item extends keyof T
    ? Get<T[Item], Rest>
    : never
  : K extends keyof T
  ? T[K]
  : never;
