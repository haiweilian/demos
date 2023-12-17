import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log('Init completed');

  app.enableShutdownHooks(); // 必须启用才能监听到信号

  await app.listen(3000, () => {
    console.log('Listener start');
  });

  setTimeout(() => {
    app.close();
    // process.kill(process.pid);
  }, 5000);
}
bootstrap();
