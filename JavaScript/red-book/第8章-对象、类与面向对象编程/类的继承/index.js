class Vehicle {
  constructor() {
    this.hasEngine = true;
  }
  run() {
    console.log("...run");
  }
  static identify() {
    console.log("Vehicle");
  }
}
// static 声明静态方法，可以类上直接调用。
Vehicle.identify(); // "Vehicle"

// Bus 继承 Vehicle 类。
class Bus extends Vehicle {
  constructor() {
    // 在构造函数中使用 super 可以调用父类构造函数，将返回的实例赋值给 this。
    super();
    console.log(this);
  }
  // 在静态方法可以通过 super 调用继承的类上定义的静态方法。
  static identify() {
    super.identify();
  }
}

Bus.identify(); // "Bus"、"Vehicle"

let bus = new Bus();
bus.run(); // ...run

// 除语法层面更符合语义外，继承方式与构造函数的一致
console.log(bus.__proto__.constructor === Bus); // true
console.log(bus.__proto__.__proto__.constructor === Vehicle); //true
console.log(bus.__proto__.__proto__ === Vehicle.prototype); //true
console.log(bus instanceof Vehicle); // true
console.log(bus instanceof Bus); // true
