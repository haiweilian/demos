class Person {}

let person = new Person();

console.log(typeof Person); // function
console.log(Person.prototype.constructor === Person); // true
console.log(person.__proto__ === Person.prototype); // true
console.log(person.__proto__.constructor === Person.prototype.constructor); // true
