function twoParams(a: number, b: number) {
  return a + b;
}

let curryOne = twoParams.bind(null, 123);

curryOne(11);
// curryOne("11");
