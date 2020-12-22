let key = "name";
let person = {};
person[key] = key;

// 等同于
let key = "name";
let person = {
  [key]: key,
};
