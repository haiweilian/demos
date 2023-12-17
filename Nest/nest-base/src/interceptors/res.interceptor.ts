import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map, tap } from 'rxjs';

@Injectable()
export class ResInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    console.log('Interceptor Before...');

    // 如果 next.handle 函数不调用则控制器不会执行
    return next.handle().pipe(
      tap(() => {
        console.log(`Interceptor After... ${Date.now() - now}ms`);
      }),
      map((data) => {
        return { data };
      }),
    );
  }
}
