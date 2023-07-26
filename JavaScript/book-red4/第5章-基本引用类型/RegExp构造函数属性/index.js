let text = "2020-11-29";
let pattern = /(\d{4})-(\d{2})-(\d{2})/g;

pattern.test(text);

console.log(RegExp.$1); // 2008
console.log(RegExp.$2); // 12
console.log(RegExp.$3); // 31
console.log(RegExp.$4); // ""
