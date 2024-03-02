function add(a, b) {
  throw Error('add');
  return a + b;
}

console.log(add(1, 2));
