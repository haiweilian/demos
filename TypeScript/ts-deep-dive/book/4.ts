export {};

type First<Tuple extends unknown[]> = Tuple extends [infer T, ...infer R] ? T : never;
type res1 = First<[1, 2, 3]>;

type Last<Tuple extends unknown[]> = Tuple extends [...infer R, infer T] ? T : never;
type res2 = Last<["1", "2", "3"]>;

type MapType<T> = {
  [Key in keyof T]: [T[Key], T[Key], T[Key]];
};
type res3 = MapType<{
  a: 1;
  b: "2";
}>;

const getFn = (str: `aa${string}`) => {
  return str;
};
getFn("aa-xx");
