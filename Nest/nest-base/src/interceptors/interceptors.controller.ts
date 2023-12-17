import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ResInterceptor } from './res.interceptor';

@Controller('interceptors')
// @UseInterceptors(ResInterceptor)
export class InterceptorsController {
  @Get()
  // @UseInterceptors(ResInterceptor)
  get() {
    return 'ok';
  }
}
