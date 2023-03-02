import { Module } from '@nestjs/common';
import { PipeController } from './pipe.controller';

@Module({
  controllers: [PipeController],
})
export class PipeModule {}
