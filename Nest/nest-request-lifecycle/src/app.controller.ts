import { BadRequestException, Controller, Get, InternalServerErrorException, Query, UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { AppService } from './app.service';
import { ControllerGuard, RouteGuard } from './app.guard';
import { ControllerInterceptor, RouteInterceptor } from './app.interceptor';
import { ControllerPipe, RouteParamPipe, RoutePipe } from './app.pipe';
import { ControllerFilter, RouteFilter } from './app.filter';

@Controller()
@UseGuards(ControllerGuard)
@UseInterceptors(ControllerInterceptor)
@UsePipes(ControllerPipe)
@UseFilters(ControllerFilter)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @UseGuards(RouteGuard)
  @UseInterceptors(RouteInterceptor)
  @UsePipes(RoutePipe)
  @UseFilters(RouteFilter)
  getHello(@Query('id', new RouteParamPipe(1)) id, @Query('name', new RouteParamPipe(2)) name): string {
    console.log('AppController.getHello: 调用控制器');

    const random = Math.random();
    if (random < 0.2) {
      throw new BadRequestException('请求异常');
    } else if (random < 0.4) {
      throw new InternalServerErrorException('内部服务器错误');
    } else if (random < 0.6) {
      throw new Error('未知异常');
    }

    return this.appService.getHello();
  }
}
