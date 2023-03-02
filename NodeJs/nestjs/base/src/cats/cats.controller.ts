import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  Post,
  Query,
  Redirect,
  Req,
  Param,
  Ip,
  Inject,
} from '@nestjs/common';
import type { Request } from 'express';
import { CreateCatDto } from './cats.dto';
import { CatsService } from './cats.service';
import { Cats2Service } from './cats2.service';

@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @Inject()
  private cats2Service: Cats2Service;

  @Get('/all')
  async getAll(@Req() request: Request, @Ip() ip: string) {
    console.log(request, ip);
    return this.catsService.findAll();
  }

  @Get('/one')
  getOne(@Query() query: { id: string }) {
    return `This is ${query.id}.`;
  }

  @Get('/one/:id')
  getOne2(@Param('id') id) {
    return `This is ${id}.`;
  }

  @Post('/create')
  @HttpCode(200)
  @Header('x-token-xxx', '123')
  create(@Body() body: CreateCatDto) {
    this.catsService.create(body);
  }

  @Get('/redirect')
  @Redirect('https://docs.nestjs.com')
  createRedirect() {
    return null;
  }
}
