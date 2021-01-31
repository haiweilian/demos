// ====== 类、继承、基础
class Animal {
  name;
  constructor(name: string) {
    this.name = name;
  }
  move(dis: number = 0) {
    console.log(`Animal move ${dis}s`);
  }
}

class Dog extends Animal {
  constructor(name: string) {
    super(name);
  }
  bark() {
    console.log(`Woof! Woof! ${this.name}`);
  }
}

let dog = new Dog("HH");
dog.bark();
dog.move(10);
dog.bark();

// ====== 公共，私有与受保护的修饰符
class Cat extends Animal {
  constructor(name: string) {
    super(name);
    this.name = name;
    this.pri();
  }
  // 我们可以自由的访问程序里定义的成员,默认 public
  public name: string = "dog";
  // 不能在声明它的类的外部访问
  private pri() {}
  // 与 private 类似，但在派生类中仍然可以访问
  protected pro() {}
  // 将属性设置为只读的， 只读属性必须在声明时或构造函数里被初始化
  readonly legs: number = 4;
  // 直接通过类访问 Cat.food
  static food: string = "bones";
  run() {}
  sleep() {
    console.log("Dog sleep");
  }
}

let cat = new Cat("CC");
// cat.pri();

// ====== 抽象类
// -- 使用 abstract 定义抽象，抽象类中的抽象函数，必须在派生类中实现。
abstract class Run {
  abstract move(): void;
}
class Car extends Run {
  move() {
    console.log("...run");
  }
}
