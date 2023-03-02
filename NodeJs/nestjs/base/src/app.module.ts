/**
 * 应用程序的根模块
 */
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatsModule } from './cats/cats.module';
import { DogsModule } from './dogs/dogs.module';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { ExceptionfiltersModule } from './exceptionfilters/exceptionfilters.module';
import { HttpExceptionFilter } from './exceptionfilters/http-exception.filter';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { PipeModule } from './pipe/pipe.module';
import { ValidationPipe } from './pipe/validate.pipe';
import { GuardsModule } from './guards/guards.module';
import { RolesGuard } from './guards/roles.guard';
import { InterceptorModule } from './interceptor/interceptor.module';
import { InterceptorInterceptor } from './interceptor/interceptor.interceptor';

@Module({
  imports: [
    CatsModule,
    DogsModule,
    ExceptionfiltersModule,
    PipeModule,
    GuardsModule,
    InterceptorModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: InterceptorInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 应用中间件
    // consumer.apply(LoggerMiddleware)
    consumer.apply(LoggerMiddleware).exclude('dogs/(.*)').forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
