import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserPhotoService } from './user-photo.service';
import { CreateUserPhotoDto } from './dto/create-user-photo.dto';
import { UpdateUserPhotoDto } from './dto/update-user-photo.dto';

@Controller('user-photo')
export class UserPhotoController {
  constructor(private readonly userPhotoService: UserPhotoService) {}

  @Post()
  create(@Body() createUserPhotoDto: CreateUserPhotoDto) {
    return this.userPhotoService.create(createUserPhotoDto);
  }

  @Get()
  findAll() {
    return this.userPhotoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userPhotoService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserPhotoDto: UpdateUserPhotoDto,
  ) {
    return this.userPhotoService.update(+id, updateUserPhotoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userPhotoService.remove(+id);
  }
}
