import { PartialType } from '@nestjs/mapped-types';
import { CreateControllerDto } from './create-controller.dto';

export class UpdateControllerDto extends PartialType(CreateControllerDto) {}
