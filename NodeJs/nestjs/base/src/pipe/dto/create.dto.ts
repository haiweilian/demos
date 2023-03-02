import * as Joi from '@hapi/joi';
import { IsString, IsInt } from 'class-validator';

export class CreateDto {
  @IsString()
  name: string;

  @IsInt()
  age: string;
}

export const CreateCatSchema = Joi.object({
  name: Joi.string(),
  age: Joi.number(),
});
