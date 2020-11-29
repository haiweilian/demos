let s1 = [2, 3, 5, 4, 5, 2, 2];
let s2 = new Set(s1);

s2.add(+0);
s2.add(-0);

console.log([...s2]); // [ 2, 3, 5, 4, 0 ]

//======================================
let m1 = new Map();
let m2 = { p: "Hello World" };

m1.set(m2, "content");

console.log(m1.get(m2)); // content
