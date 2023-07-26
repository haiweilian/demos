function* generatorFn() {
  yield 1;
  yield 2;
  return 3;
}

let generator = generatorFn();
console.log(generator.next()); // { value: 1, done: false }
console.log(generator.next()); // { value: 2, done: false }
console.log(generator.next()); // { value: 3, done: true }
