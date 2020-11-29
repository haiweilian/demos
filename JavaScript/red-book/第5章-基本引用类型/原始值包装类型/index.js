let s1 = "text";
let s2 = s1.substring(2);
console.log(s2); // xt

let s3 = new String("text");
let s4 = s3.substring(2);
console.log(s4); // xt

let s5 = "text";
s5.color = "red";
console.log(s5.color); // undefined

let s6 = new String("text");
s6.color = "red";
console.log(s6.color); // red
