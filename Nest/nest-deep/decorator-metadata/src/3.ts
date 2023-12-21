import 'reflect-metadata'

@classDecor
class Example{
  @attributeDecor
  attribute: string;

  @accessorDecor
  get accessor(): string{
    return this.attribute
  }

  constructor(attribute: string){
    this.attribute = attribute
  }

  @functionDecor
  func(@paramsDecor params: number): number{
    return params
  }
}

function classDecor(constructor: Function){
  // 输出 classDecor undefined [ [Function: String] ] undefined
  console.log('classDecor')
  console.log(Reflect.getMetadata('design:type', constructor))
  console.log(Reflect.getMetadata('design:paramtypes', constructor))
  console.log(Reflect.getMetadata('design:returntype', constructor))
}

function functionDecor(target: any, propertyKey: string, descriptor: PropertyDescriptor){
  // 输出 functionDecor [Function: Function] [ [Function: Number] ] [Function: Number]
  console.log('functionDecor')
  console.log(Reflect.getMetadata('design:type', target, propertyKey ))
  console.log(Reflect.getMetadata('design:paramtypes', target, propertyKey))
  console.log(Reflect.getMetadata('design:returntype', target, propertyKey))
}

function accessorDecor(target: any, propertyKey: string, descriptor: PropertyDescriptor){
  // 输出 accessorDecor [Function: String] [] undefined
  console.log('accessorDecor')
  console.log(Reflect.getMetadata('design:type', target, propertyKey ))
  console.log(Reflect.getMetadata('design:paramtypes', target, propertyKey))
  console.log(Reflect.getMetadata('design:returntype', target, propertyKey))
}

function attributeDecor(target: any, propertyKey: string){
  // 输出 attributeDecor [Function: String] undefined undefined
  console.log('attributeDecor')
  console.log(Reflect.getMetadata('design:type', target, propertyKey ))
  console.log(Reflect.getMetadata('design:paramtypes', target, propertyKey))
  console.log(Reflect.getMetadata('design:returntype', target, propertyKey))
}

function paramsDecor(target: Object, propertyKey: string | symbol, parameterIndex: number){
  // 输出 paramsDecor [Function: Function] [ [Function: Number] ] [Function: Number]
  console.log('paramsDecor')
  console.log(Reflect.getMetadata('design:type', target, propertyKey ))
  console.log(Reflect.getMetadata('design:paramtypes', target, propertyKey))
  console.log(Reflect.getMetadata('design:returntype', target, propertyKey))
}
