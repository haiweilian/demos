import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { InterceptorInterceptor } from './interceptor.interceptor';
import { TransformInterceptor } from './transform.interceptor';

@Controller('interceptor')
// @UseInterceptors(InterceptorInterceptor)
export class InterceptorController {
  @Get('time')
  async time() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('ok');
      }, 1000);
    });
  }

  @Get('transform')
  @UseInterceptors(TransformInterceptor)
  transform() {
    return [1, 2, 3, 4, 5];
  }
}
