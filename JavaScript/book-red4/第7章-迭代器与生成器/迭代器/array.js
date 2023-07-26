let list = ["a", "b", "c"];

for (let item of list) {
  console.log(item);
}
// a
// b
// c

let listr = list[Symbol.iterator](); // 调用内部的迭代函数
console.log(listr.next()); // { value: 'a', done: false }
console.log(listr.next()); // { value: 'b', done: false }
console.log(listr.next()); // { value: 'c', done: false }
console.log(listr.next()); // { value: undefined, done: true }
