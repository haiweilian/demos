import {
  IsInt,
  IsNotEmpty,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Name } from '../decorators/name.decorator';

// 1. 装饰器从下到上执行
// 2. 如果自定义错误，则需要每个装饰器都需要自定义。
// 3. 尝试一种方案指定验证的名称列如 @Name('年龄') 替换默认提示信息未中文，这样就可以在不自定义的情况下有良好的验证信息。
export class CreateCustomDto {
  @Name('年龄')
  @Max(100)
  @Min(0)
  @IsInt()
  age: number;

  @Name('名称')
  @MinLength(3)
  @MaxLength(10)
  @IsNotEmpty()
  name: string;
}
