import { ExceptionFilter, Catch, BadRequestException, InternalServerErrorException } from '@nestjs/common';

@Catch()
export class GlobalFilter implements ExceptionFilter {
  catch(exception, host) {
    console.log('GlobalFilter: 全局异常过滤器', exception);
    host.switchToHttp().getResponse().json(exception.message);
  }
}

@Catch(InternalServerErrorException)
export class ControllerFilter implements ExceptionFilter {
  catch(exception, host) {
    console.log('ControllerFilter: 控制器异常过滤器', exception);
    host.switchToHttp().getResponse().json(exception.message);
  }
}

@Catch(BadRequestException)
export class RouteFilter implements ExceptionFilter {
  catch(exception, host) {
    console.log('RouteFilter: 路由异常过滤器', exception);
    host.switchToHttp().getResponse().json(exception.message);
  }
}
