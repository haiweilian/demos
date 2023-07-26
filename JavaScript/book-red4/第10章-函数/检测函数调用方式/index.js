function Foo() {
  return new.target;
}
console.log(Foo()); // undefined
console.log(new Foo()); // [Function: Foo]
