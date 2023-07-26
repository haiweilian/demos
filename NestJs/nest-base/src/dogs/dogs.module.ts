import { Module } from '@nestjs/common';
import { CatsModule } from '../cats/cats.module';
import { DogsController } from './dogs.controller';

@Module({
  // 导出 Cats 的模块
  imports: [CatsModule],
  controllers: [DogsController],
})
export class DogsModule {}
