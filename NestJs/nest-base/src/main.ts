/**
 * 应用程序入口文件
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { LoggerMiddleware } from './middleware/logger.middleware';
// import { HttpExceptionFilter } from './exceptionfilters/http-exception.filter';
// import { ValidationPipe } from './pipe/validate.pipe';
// import { RolesGuard } from './guards/roles.guard';
// import { InterceptorInterceptor } from './interceptor/interceptor.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.use(new LoggerMiddleware());
  // app.useGlobalFilters(new HttpExceptionFilter());
  // app.useGlobalPipes(new ValidationPipe());
  // app.useGlobalGuards(new RolesGuard());
  // app.useGlobalInterceptors(new InterceptorInterceptor());
  await app.listen(3000);
}
bootstrap();
