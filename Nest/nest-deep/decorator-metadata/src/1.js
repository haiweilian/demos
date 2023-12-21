"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
let Example = class Example {
    get accessor() {
        return this.attribute;
    }
    func(params) {
        return params;
    }
};
__decorate([
    attributeDecor,
    __metadata("design:type", String)
], Example.prototype, "attribute", void 0);
__decorate([
    accessorDecor,
    __metadata("design:type", String),
    __metadata("design:paramtypes", [])
], Example.prototype, "accessor", null);
__decorate([
    functionDecor,
    __param(0, paramsDecor),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Number)
], Example.prototype, "func", null);
Example = __decorate([
    classDecor
], Example);
function classDecor(constructor) {
    console.log("classDecor is called");
}
function functionDecor(target, propertyKey, descriptor) {
    console.log("functionDecor is called");
}
function accessorDecor(target, propertyKey, descriptor) {
    console.log("accessorDecor is called");
}
function attributeDecor(target, propertyKey) {
    console.log("attributeDecor is called");
}
function paramsDecor(target, propertyKey, parameterIndex) {
    console.log("paramsDecor is called");
}
console.log("new Example instance");
new Example();
