import { Module } from '@nestjs/common';
import { InterceptorsController } from './interceptors.controller';

@Module({
  controllers: [InterceptorsController]
})
export class InterceptorsModule {}
