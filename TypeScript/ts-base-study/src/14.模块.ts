import { ZipCodeValidator } from "./14/ZipCodeValidator";

// ES6 导入并使用
let validator = new ZipCodeValidator();
validator.isAcceptable("11111");
validator.isAcceptable("111111");
