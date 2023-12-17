import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';

export class MyParseIntPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const val = Number(value);
    if (Number.isNaN(value)) {
      throw new BadRequestException('Validation failed');
    }
    return val;
  }
}
