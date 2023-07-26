function foo() {}
let bar = function () {};
let baz = () => {};
console.log(foo.name); // foo
console.log(bar.name); // bar
console.log(baz.name); // baz

let anony = new Function();
console.log(anony.name); // anonymous

function foo() {}
console.log(foo.bind(null).name); // bound foo

let info = {
  num: 1,
  get age() {
    return this.num;
  },
  set age(num) {
    this.num = num;
  },
};
let descriptor = Object.getOwnPropertyDescriptor(info, "age");
console.log(descriptor.get.name); // get age
console.log(descriptor.set.name); // set age
