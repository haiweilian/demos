function fetch() {
  return new Promise((resolve, reject) => {
    throw Error("error");
  });
}

// function fetch() {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       // 无法捕获，宏任务内的错误
//       throw Error("error");
//     })
//   });
// }

fetch()
  .then()
  .catch((error) => {
    console.log("..........", error);
  });
