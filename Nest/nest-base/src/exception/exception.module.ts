import { Module } from '@nestjs/common';
import { ExceptionController } from './exception.controller';

@Module({
  controllers: [ExceptionController],
})
export class ExceptionModule {}
