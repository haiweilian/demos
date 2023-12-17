import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Headers,
  Ip,
  HostParam,
  Req,
  Res,
  Header,
  HttpCode,
  Next,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ControllersService } from './controllers.service';
import { CreateControllerDto } from './dto/create-controller.dto';
import { UpdateControllerDto } from './dto/update-controller.dto';

@Controller('controllers')
export class ControllersController {
  constructor(private readonly controllersService: ControllersService) {}

  @Get('req')
  req(
    @Query() query,
    @Headers() headers,
    @Ip() ip,
    @HostParam() host,
    @Req() req: Request,
  ) {
    console.log(req);
    return {
      query,
      headers,
      ip,
      host,
    };
  }

  @Post('res')
  @Header('token', 'xxxx')
  @HttpCode(300)
  res(@Res({ passthrough: true }) res: Response, @Next() next) {
    // next()
    res.header('token2', 'yyyy');
    return {};
  }

  @Post()
  create(@Body() createControllerDto: CreateControllerDto) {
    return this.controllersService.create(createControllerDto);
  }

  @Get()
  findAll() {
    return this.controllersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.controllersService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateControllerDto: UpdateControllerDto,
  ) {
    return this.controllersService.update(+id, updateControllerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.controllersService.remove(+id);
  }
}
