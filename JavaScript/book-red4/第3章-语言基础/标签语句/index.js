let num1 = 0;
outermost: for (let i = 0; i < 5; i++) {
  for (let j = 0; j < 5; j++) {
    if (i === 1 && j === 1) {
      break outermost; // 结束 i 层的循环。
    }
    num1++;
  }
}
console.log(num1); // 6

let num2 = 0;
for (let i = 0; i < 5; i++) {
  for (let j = 0; j < 5; j++) {
    if (i === 1 && j === 1) {
      break; // 只能结束 j 层的循环，i 层的循环还是循环了 5 次。
    }
    num2++;
  }
}
console.log(num2); // 21
