import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ControllersModule } from './controllers/controllers.module';
import { ProvidersModule } from './providers/providers.module';
import { ModulesModule } from './modules/modules.module';
import { MiddlewareModule } from './middleware/middleware.module';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { LoggerFnMiddleware } from './middleware/logger-fn.middleware';
import { ExceptionModule } from './exception/exception.module';
import { HttpFilter } from './exception/http.filter';
import { PipeModule } from './pipe/pipe.module';
import { ValidatePipe } from './pipe/validate.pipe';
import { GuardsModule } from './guards/guards.module';
import { RolesGuard } from './guards/roles.guard';
import { InterceptorsModule } from './interceptors/interceptors.module';
import { ResInterceptor } from './interceptors/res.interceptor';
import { CustomDecoratorsModule } from './custom-decorators/custom-decorators.module';
import { CustomProvidersModule } from './custom-providers/custom-providers.module';
import { DynamicModulesModule } from './dynamic-modules/dynamic-modules.module';
import { CircularDependencyModule } from './circular-dependency/circular-dependency.module';
import { LifecycleEventsModule } from './lifecycle-events/lifecycle-events.module';

@Module({
  imports: [
    ControllersModule,
    ProvidersModule,
    ModulesModule,
    MiddlewareModule,
    ExceptionModule,
    PipeModule,
    GuardsModule,
    InterceptorsModule,
    CustomDecoratorsModule,
    CustomProvidersModule,
    DynamicModulesModule.forRoot({
      name: 'lian',
    }),
    CircularDependencyModule,
    LifecycleEventsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpFilter,
    },
    {
      provide: APP_PIPE,
      useClass: ValidatePipe,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware, LoggerFnMiddleware).forRoutes('*');
  }
}
