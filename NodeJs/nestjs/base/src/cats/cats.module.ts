import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';
import { Cats2Service } from './cats2.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService, Cats2Service],
  // 共享模块 每个导入 CatsModule 的模块都可以访问 CatsService
  exports: [CatsService],
})
export class CatsModule {}
