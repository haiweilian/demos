"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
class Example {
}
const exp = new Example();
Reflect.defineMetadata('type', 'Example', exp);
Reflect.defineMetadata('type', 'String', exp, 'text');
console.log(Reflect.getMetadata('type', exp));
console.log(Reflect.getMetadata('type', exp, 'text'));
