import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { LoggerMiddleware } from './middleware/logger.middleware';
// import { LoggerFnMiddleware } from './middleware/logger-fn.middleware';
// import { HttpFilter } from './exception/http.filter';
// import { ValidatePipe } from './pipe/validate.pipe';
// import { RolesGuard } from './guards/roles.guard';
// import { ResInterceptor } from './interceptors/res.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // app.use(new LoggerMiddleware().use);
  // app.use(LoggerFnMiddleware);

  // app.useGlobalFilters(new HttpFilter());

  // app.useGlobalPipes(new ValidatePipe());

  // app.useGlobalGuards(new RolesGuard());

  // app.useGlobalInterceptors(new ResInterceptor());

  await app.listen(3000);
}
bootstrap();
