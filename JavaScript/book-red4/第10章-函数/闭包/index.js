function outside() {
  let num = 1;
  // return function (add) {
  //   return (num += add);
  // };
  return function inner(add) {
    return (num += add);
  };
}

let inner = outside();
console.log(inner(1)); // 2
console.log(inner(1)); // 3
console.log(inner(1)); // 4
