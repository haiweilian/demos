import { Module } from '@nestjs/common';
import { PipeService } from './pipe.service';
import { PipeController } from './pipe.controller';

@Module({
  controllers: [PipeController],
  providers: [PipeService],
})
export class PipeModule {}
