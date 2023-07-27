import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UsePipes,
} from '@nestjs/common';
import { CreateCatSchema, CreateDto } from './dto/create.dto';
import { JoiValidationPipe, ValidationPipe } from './validate.pipe';

@Controller('pipe')
export class PipeController {
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return id;
  }

  @Post('/create/joi')
  // @UsePipes(new JoiValidationPipe(CreateCatSchema))
  createJoi(@Body() createDto: CreateDto) {
    return createDto;
  }

  @Post('/create/class')
  // @UsePipes(ValidationPipe)
  createClass(@Body() createDto: CreateDto) {
    return createDto;
  }
}
