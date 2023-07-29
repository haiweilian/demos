import { Body, Controller, Post } from '@nestjs/common';
import { CreateBaseDto } from './dto/create.dto';

@Controller('base')
export class BaseController {
  @Post()
  add(@Body() dto: CreateBaseDto) {
    return dto;
  }
}
