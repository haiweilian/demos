// 注：严格模式下不允许使用。
function WithThis() {
  this.name = "lian";
  this.age = 23;
  this.getUserInfo = function () {
    with (this) {
      return {
        name: name,
        age: age,
      };
    }
  };
}

const withThis = new WithThis();

console.log(withThis.getUserInfo()); // { name: 'lian', age: 23 }
