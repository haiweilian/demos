import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  // UseFilters,
} from '@nestjs/common';
import { ForbiddenException } from './forbidden.exception';
import { ExceptionfiltersService } from './exceptionfilters.service';
// import { HttpExceptionFilter } from './http-exception.filter';

@Controller('exceptionfilters')
// @UseFilters(HttpExceptionFilter)
export class ExceptionfiltersController {
  constructor(private exceptionfiltersService: ExceptionfiltersService) {}

  // @UseFilters(HttpExceptionFilter)
  @Get('/baseError')
  baseError() {
    throw new HttpException('基础的错误信息', HttpStatus.FORBIDDEN);
  }

  @Get('/cusError')
  cusError() {
    throw new ForbiddenException();
  }

  @Get('/errorLog')
  errorLog() {
    return this.exceptionfiltersService.getAll();
  }
}
