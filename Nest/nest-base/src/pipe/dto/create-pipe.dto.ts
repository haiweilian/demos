import { IsInt, IsString } from 'class-validator';

export class CreatePipeDto {
  @IsString()
  name: string;

  @IsInt()
  age: number;
}
