async function foo() {
  console.log(2);
  console.log(await 6);
  console.log(7);
}

async function bar() {
  console.log(4);
  console.log(await Promise.resolve(8));
  console.log(9);
}

console.log(1);
foo();
console.log(3);
bar();
console.log(5);
