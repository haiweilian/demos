let list = {
  a: "a",
  b: "b",
  c: "c",
  // 手动部署 Iterator 接口
  [Symbol.iterator]() {
    // 使用闭包保存所有的值，和迭代的次数
    let keys = Object.values(this);
    let count = 0;
    return {
      next() {
        // 如果本次迭代有值，次数加1，done 为 false 继续下次迭代。
        if (keys[count]) {
          return {
            value: keys[count++],
            done: false,
          };
        }
        // 如果本次迭代无值，done 为 true 结束迭代。
        else {
          return {
            value: undefined,
            done: true,
          };
        }
      },
    };
  },
};

for (let i of list) {
  console.log(i);
}
// a
// b
// c

let listr = list[Symbol.iterator]();
console.log(listr.next()); // { value: 'a', done: false }
console.log(listr.next()); // { value: 'b', done: false }
console.log(listr.next()); // { value: 'c', done: false }
console.log(listr.next()); // { value: undefined, done: true }
