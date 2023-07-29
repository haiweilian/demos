import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BaseModule } from './base/base.module';
import { APP_PIPE } from '@nestjs/core';
import { ValidatorException } from './exception/validator.exception';
import { CustomModule } from './custom/custom.module';

@Module({
  imports: [BaseModule, CustomModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        transform: true,
        validationError: {
          target: true,
          value: true,
        },
        // 完全自定义错误信息，一些控制错误配置的参数将失效
        exceptionFactory(errors) {
          console.log(errors);
          return new ValidatorException(errors);
        },
      }),
    },
  ],
})
export class AppModule {}
