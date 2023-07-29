import { Body, Controller, Post } from '@nestjs/common';

import { CreateCustomDto } from './dto/create.dto';

@Controller('custom')
export class CustomController {
  @Post()
  add(@Body() dto: CreateCustomDto) {
    return dto;
  }
}
