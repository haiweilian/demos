import { NestInterceptor } from '@nestjs/common';
import { tap } from 'rxjs';

export class GlobalInterceptor implements NestInterceptor {
  intercept(context, next) {
    console.log('GlobalInterceptor: 全局拦截器-控制器前');
    return next.handle().pipe(
      tap(() => {
        console.log('GlobalInterceptor: 全局拦截器-控制器后');
      }),
    );
  }
}

export class ControllerInterceptor implements NestInterceptor {
  intercept(context, next) {
    console.log('ControllerInterceptor: 控制器拦截器-控制器前');
    return next.handle().pipe(
      tap(() => {
        console.log('ControllerInterceptor: 控制器拦截器-控制器后');
      }),
    );
  }
}

export class RouteInterceptor implements NestInterceptor {
  intercept(context, next) {
    console.log('RouteInterceptor: 路由拦截器-控制器前');
    return next.handle().pipe(
      tap(() => {
        console.log('RouteInterceptor: 路由拦截器-控制器后');
      }),
    );
  }
}
