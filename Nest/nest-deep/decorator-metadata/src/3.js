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
