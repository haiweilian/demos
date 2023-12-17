import { Controller, Get, Post, UseFilters } from '@nestjs/common';
import { ForbiddenException } from './forbidden.exception';
// import { HttpFilter } from './http.filter';

@Controller('exception')
// @UseFilters(HttpFilter)
export class ExceptionController {
  @Get()
  // @UseFilters(HttpFilter)
  get() {
    throw new ForbiddenException();
  }

  @Post()
  post() {
    throw new Error('未知异常');
  }
}
