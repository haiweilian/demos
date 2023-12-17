import { Module } from '@nestjs/common';
import { CustomDecoratorsController } from './custom-decorators.controller';

@Module({
  controllers: [CustomDecoratorsController],
})
export class CustomDecoratorsModule {}
