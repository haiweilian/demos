import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { ObjectSchema } from '@hapi/joi';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private schema: ObjectSchema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    console.log('JoiValidationPipe', value, metadata);
    const { error } = this.schema.validate(value);
    if (error) {
      throw new BadRequestException('Validation failed');
    }
    return value;
  }
}

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    // value 当前控制器方法接收的值
    // metadata 当前处理方法的元数据
    // metadata.type 参数的类型
    // metadata.metatype 参数的原类型
    // metadata.data 使用参数装饰器传入的值
    console.log('ValidationPipe', value, metadata);
    const metatype = metadata.metatype;
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    console.log('ValidationPipe', object);
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new BadRequestException('Validation failed');
    }
    return value;
  }

  // 是否验证
  private toValidate(metatype): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
