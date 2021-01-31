import { ZipCodeValidator } from "./14/ZipCodeValidator";

let validator = new ZipCodeValidator();

console.log(validator.isAcceptable("11111")); // true
console.log(validator.isAcceptable("111111")); // false
