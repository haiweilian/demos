// ============= Test Cases =============
import type { Equal, Expect } from "./test-utils";

class A {
  public str: string;
  protected num: number;
  private bool: boolean;
  constructor() {
    this.str = "naive";
    this.num = 19260917;
    this.bool = true;
  }

  getNum() {
    return Math.random();
  }
}

type cases = [Expect<Equal<ClassPublicKeys<A>, "str" | "getNum">>];

// ============= Your Code Here =============
type ClassPublicKeys<T> = keyof T;
