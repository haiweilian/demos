// 协变（Covariant）：只在同一个方向；
// 逆变（Contravariant）：只在相反的方向；
// 双向协变（Bivariant）：包括同一个方向和不同方向；
// 不变（Invariant）：如果类型不完全相同，则它们是不兼容的。

// 协变（Covariant）：返回类型必须包含足够的数据。
interface Point2D {
  x: number;
  y: number;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

let iMakePoint2D = (): Point2D => ({ x: 0, y: 0 });
let iMakePoint3D = (): Point3D => ({ x: 0, y: 0, z: 0 });

iMakePoint2D = iMakePoint3D;
// iMakePoint3D = iMakePoint2D; // error 参数不足

// 双向协变（Bivariant）函数参数的比较是双向协变。
let iTakePoint2D = (point: Point2D) => {};
let iTakePoint3D = (point: Point3D) => {};

iTakePoint3D = iTakePoint2D; // ok, 这是合理的
iTakePoint2D = iTakePoint3D; // ok，需要关闭 strictFunctionTypes

// 逆变（Contravariant）：只在相反的方向；
// https://juejin.cn/post/6855517117778198542
class Animal {
  constructor(public name: string) {}
}
class Cat extends Animal {
  meow() {
    console.log("cat");
  }
}

let animal = new Animal("animal");
let cat = new Cat("cat");
animal = cat; // ok

let visitAnimal = (animal: Animal) => {
  animal.name;
};
let visitCat = (cat: Cat) => {
  cat.name;
  cat.meow();
};

// 实际调用会出错，因为没有 meow
visitAnimal = visitCat;
visitAnimal(animal); // error
visitAnimal(cat);

visitCat = visitAnimal;
// visitCat(animal);
visitCat(cat);
