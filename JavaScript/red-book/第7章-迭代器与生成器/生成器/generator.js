function* generatorFn() {
  return "generator";
}

let generator = generatorFn();
console.log(generator); // generatorFn <suspended>
console.log(generator.next()); // { value: 'generator', done: true }
