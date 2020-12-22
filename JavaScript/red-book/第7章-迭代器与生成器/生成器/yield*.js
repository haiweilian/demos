function* generatorFn1() {
  yield* [1, 2, 3];
}

for (let item of generatorFn1()) {
  console.log(item);
}

// = 等同于
function* generatorFn2() {
  for (let i = 1; i < 4; i++) {
    yield i;
  }
}

for (let item of generatorFn2()) {
  console.log(item);
}
