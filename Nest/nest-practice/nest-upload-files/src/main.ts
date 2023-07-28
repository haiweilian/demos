import { NestFactory } from '@nestjs/core';
import { join } from 'path';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  app.useStaticAssets(join(__dirname, '../public'), {
    prefix: '/',
  });
  app.useStaticAssets(join(__dirname, '../uploads'), {
    prefix: '/uploads',
  });
  await app.listen(3000);
}
bootstrap();
