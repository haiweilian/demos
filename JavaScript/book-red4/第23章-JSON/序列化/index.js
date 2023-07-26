// ---
let s = { name: "lian", age: 22, status: true };

let s1 = JSON.stringify(s, (key, value) => {
  if (typeof value === "string") {
    return value.toUpperCase();
  }
  return value;
});
console.log(s1); // {"name":"LIAN","age":22,"status":true}

// ---
let sto = {
  name: "lian",
  age: 22,
  status: true,
  toJSON() {
    return this.age * 2;
  },
};
console.log(JSON.stringify(sto)); // 44
