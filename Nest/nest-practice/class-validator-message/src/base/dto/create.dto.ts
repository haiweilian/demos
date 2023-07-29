import {
  IsInt,
  IsNotEmpty,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

// 1. 装饰器从下到上执行
// 2. 如果自定义错误，则需要每个装饰器都需要自定义。
// 3. 尝试一种方案指定验证的名称列如 @Name('年龄') 替换默认提示信息为中文，这样就可以在不自定义的情况下有良好的验证信息。
export class CreateBaseDto {
  @Max(100, {
    message: '年龄必须小于100',
  })
  @Min(0, {
    message: '年龄必须大于0',
  })
  @IsInt({
    message: '年龄必须是数字',
  })
  age: number;

  @MinLength(3, {
    message: '名称最少3个字符',
  })
  @MaxLength(10, {
    message: '名称最大10个字符',
  })
  @IsNotEmpty({
    message: '名称不能为空',
  })
  name: string;
}
