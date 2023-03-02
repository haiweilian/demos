import { PartialType } from '@nestjs/mapped-types';
import { CreateUserPhotoDto } from './create-user-photo.dto';

export class UpdateUserPhotoDto extends PartialType(CreateUserPhotoDto) {}
