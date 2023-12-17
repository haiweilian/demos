import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  ParseArrayPipe,
  UsePipes,
} from '@nestjs/common';
import { PipeService } from './pipe.service';
import { CreatePipeDto } from './dto/create-pipe.dto';
import { UpdatePipeDto } from './dto/update-pipe.dto';
// import { ValidatePipe } from './validate.pipe';
import { MyParseIntPipe } from './parse-int.pipe';

@Controller('pipe')
// @UsePipes(ValidatePipe)
export class PipeController {
  constructor(private readonly pipeService: PipeService) {}

  @Post()
  // @UsePipes(ValidatePipe)
  create(@Body() createPipeDto: CreatePipeDto) {
    return this.pipeService.create(createPipeDto);
  }

  @Get()
  findAll() {
    return this.pipeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pipeService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', MyParseIntPipe) id: number,
    @Body() updatePipeDto: UpdatePipeDto,
  ) {
    return this.pipeService.update(id, updatePipeDto);
  }

  @Delete(':ids')
  remove(@Param('ids', new ParseArrayPipe({ items: Number })) ids: number[]) {
    return this.pipeService.remove(ids);
  }
}
