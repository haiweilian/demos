import { Module } from '@nestjs/common';
import { InterceptorController } from './interceptor.controller';

@Module({
  controllers: [InterceptorController],
})
export class InterceptorModule {}
