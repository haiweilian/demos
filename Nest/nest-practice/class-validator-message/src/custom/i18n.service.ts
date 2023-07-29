import { Injectable, OnModuleInit } from '@nestjs/common';
import { getMetadataStorage } from 'class-validator';
import { ValidationMetadata } from 'class-validator/types/metadata/ValidationMetadata';

type ValidationMap = Map<any, ValidationMetadata[]>;

const message = {
  min: `$property 不能小于 $constraint1`,
  max: `$property 不能大于 $constraint1`,
  isInt: `$property 必须是数字`,
  minLength: `$property 必须大于或等于 $constraint1 个字符`,
  maxLength: `$property 必须小于或等于 $constraint1 个字符`,
  isNotEmpty: `$property 不能为空`,
};

@Injectable()
export class I18nService implements OnModuleInit {
  onModuleInit() {
    // 获取到存储的所有验证消息
    const store = getMetadataStorage() as any;
    const validationMetadatas = store.validationMetadatas as ValidationMap;
    const validator = [...validationMetadatas.values()].flat();

    // 根据验证消息，
    validator.forEach((v) => {
      if (!v.message && message[v.name]) {
        // 这里自定义模板，使用 string-format 自写写编译，就不用修改默认的格式了，还可以自定义传入参数
        const name = Reflect.getMetadata(`${v.propertyName}_name`, v.target);
        v.message = name + message[v.name];
      }
    });
  }
}
