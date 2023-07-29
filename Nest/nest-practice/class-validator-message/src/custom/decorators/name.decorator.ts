// 自定义名称，给属性名起一个别名
export const Name = (value: string): PropertyDecorator => {
  return (object: object, propertyName: string) => {
    console.log(object.constructor, propertyName, value);
    Reflect.defineMetadata(`${propertyName}_name`, value, object.constructor);
  };
};
