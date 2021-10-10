/**
 * @子类型
 */
// 父类型
interface Animal {
  age: number;
}

// 子类型
interface Dog extends Animal {
  bark(): void;
}

let animal: Animal;
let dog: Dog;

// ok：子类型比父类型更宽泛
animal = dog;
// error：类型 "Animal" 中缺少属性 "bark"，但类型 "Dog" 中需要该属性。
// 因为在调用子类型 bark 的是不能保证是否存在，是不安全的。
// dog = animal

// 类型约束，比如要开发一个 redux
interface Action {
  type: string;
}
// T extends Action 就约束了 T 必须是 Action 的子类型，必须包含 type，其它随意
declare function dispatch<T extends Action>(action: T);

/**
 * @协变
 */
// 类型经过转换后，父子之间的类型关系不会变换
let animals: Animal[];
let dogs: Dog[];
animals = dogs;
animals[0].age;

/**
 * @逆变
 */
let visitAnimal = (animal: Animal) => {
  animal.age;
};
let visitDog = (dog: Dog) => {
  dog.age;
  dog.bark();
};

// 父子类型关系逆转了，就是逆变

// 类型是 Animal，在调用 visitDog 时，不存在 bark
// visitAnimal = visitDog;

// 类型是 Dog，在调用 visitAnimal时，存在 age
visitDog = visitAnimal;
