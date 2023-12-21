"use strict";

// 应用于一个装饰器的集合给目标对象，等价  Reflect.decorate
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

// 等价于 Reflect.metadata
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

// 一个高阶函数，返回一个装饰器函数，调用用户自定义的装饰器
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};

Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
let Example = class Example {
    get accessor() {
        return this.attribute;
    }
    constructor(attribute) {
        this.attribute = attribute;
    }
    func(params) {
        return params;
    }
};

// 属性装饰器
__decorate([
    attributeDecor,
    __metadata("design:type", String)
], Example.prototype, "attribute", void 0);

// 访问器装饰器
__decorate([
    accessorDecor,
    __metadata("design:type", String),
    __metadata("design:paramtypes", [])
], Example.prototype, "accessor", null);

// 函数装饰器
__decorate([
    functionDecor,
    // 参数装饰器
    __param(0, paramsDecor),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Number)
], Example.prototype, "func", null);

// 类装饰器
Example = __decorate([
    classDecor,
    __metadata("design:paramtypes", [String])
], Example);

function classDecor(constructor) {
    console.log('classDecor');
    console.log(Reflect.getMetadata('design:type', constructor));
    console.log(Reflect.getMetadata('design:paramtypes', constructor));
    console.log(Reflect.getMetadata('design:returntype', constructor));
}
function functionDecor(target, propertyKey, descriptor) {
    console.log('functionDecor');
    console.log(Reflect.getMetadata('design:type', target, propertyKey));
    console.log(Reflect.getMetadata('design:paramtypes', target, propertyKey));
    console.log(Reflect.getMetadata('design:returntype', target, propertyKey));
}
function accessorDecor(target, propertyKey, descriptor) {
    console.log('accessorDecor');
    console.log(Reflect.getMetadata('design:type', target, propertyKey));
    console.log(Reflect.getMetadata('design:paramtypes', target, propertyKey));
    console.log(Reflect.getMetadata('design:returntype', target, propertyKey));
}
function attributeDecor(target, propertyKey) {
    console.log('attributeDecor');
    console.log(Reflect.getMetadata('design:type', target, propertyKey));
    console.log(Reflect.getMetadata('design:paramtypes', target, propertyKey));
    console.log(Reflect.getMetadata('design:returntype', target, propertyKey));
}
function paramsDecor(target, propertyKey, parameterIndex) {
    console.log('paramsDecor');
    console.log(Reflect.getMetadata('design:type', target, propertyKey));
    console.log(Reflect.getMetadata('design:paramtypes', target, propertyKey));
    console.log(Reflect.getMetadata('design:returntype', target, propertyKey));
}
