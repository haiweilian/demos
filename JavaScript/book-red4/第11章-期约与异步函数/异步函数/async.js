function foo() {
  return 1;
}

async function fooAsync() {
  return 2;
}

console.log(foo()); // 1
console.log(fooAsync()); // Promise <fulfilled> 2

fooAsync().then((result) => {
  console.log(result); // 2
});
