// ============= Test Cases =============
import type { Equal, Expect } from "./test-utils";

SimpleVue({
  data() {
    // @ts-expect-error
    this.firstname;
    // @ts-expect-error
    this.getRandom();
    // @ts-expect-error
    this.data();

    return {
      firstname: "Type",
      lastname: "Challenges",
      amount: 10,
    };
  },
  computed: {
    fullname() {
      return `${this.firstname} ${this.lastname}`;
    },
  },
  methods: {
    getRandom() {
      return Math.random();
    },
    hi() {
      alert(this.amount);
      alert(this.fullname.toLowerCase());
      alert(this.getRandom());
    },
    test() {
      const fullname = this.fullname;
      const cases: [Expect<Equal<typeof fullname, string>>] = [] as any;
    },
  },
});

// ============= Your Code Here =============
type SimpleVueOptions<
  Data,
  Computed,
  Methods,
  _Computed = {
    [K in keyof Computed]: Computed[K] extends (...args: any[]) => infer R ? R : never;
  }
> = {
  data: (this: void) => Data;
  computed: Computed & ThisType<Data>;
  methods: Methods & ThisType<Data & Methods & _Computed>;
};
declare function SimpleVue<Data, Computed, Methods>(
  options: SimpleVueOptions<Data, Computed, Methods>
): any;
