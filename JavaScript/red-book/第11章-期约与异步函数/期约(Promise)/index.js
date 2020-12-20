let p1 = new Promise(() => {});
console.log(p1); // Promise <pending>

let p2 = new Promise((resolve, reject) => {
  resolve(1);
}).then((result) => {
  console.log(result); // 1
});
console.log(p2); // Promise <fulfilled>

let p3 = new Promise((resolve, reject) => {
  reject(2);
}).catch((error) => {
  console.log(error); // 2
});
console.log(p3); // Promise <rejected>
