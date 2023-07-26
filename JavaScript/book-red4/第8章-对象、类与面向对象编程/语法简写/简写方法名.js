let person = {
  sayName: function (name) {
    console.log(name);
  },
};

// 等同于
let person = {
  sayName(name) {
    console.log(name);
  },
};
