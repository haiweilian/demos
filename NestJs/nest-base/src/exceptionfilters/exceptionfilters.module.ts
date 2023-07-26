import { Module } from '@nestjs/common';
import { ExceptionfiltersController } from './exceptionfilters.controller';
import { ExceptionfiltersService } from './exceptionfilters.service';

@Module({
  controllers: [ExceptionfiltersController],
  providers: [ExceptionfiltersService],
})
export class ExceptionfiltersModule {}
