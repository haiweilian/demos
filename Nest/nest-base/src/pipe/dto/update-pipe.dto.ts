import { PartialType } from '@nestjs/mapped-types';
import { CreatePipeDto } from './create-pipe.dto';

export class UpdatePipeDto extends PartialType(CreatePipeDto) {}
