// ---
let sp = '{"name":"lian","age":22,"status":true}';
sp1 = JSON.parse(sp, function (key, value) {
  if (typeof value === "string") {
    return value.toUpperCase();
  }
  return value;
});
console.log(sp1); // { name: 'LIAN', age: 22, status: true }
