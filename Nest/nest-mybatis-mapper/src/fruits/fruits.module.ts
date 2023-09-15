import { Module } from '@nestjs/common';
import { FruitsController } from './fruits.controller';
import { FruitsService } from './fruits.service';
import { FruitsMapper } from './fruits.mapper';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FruitsEntity } from './fruits.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FruitsEntity])],
  controllers: [FruitsController],
  providers: [FruitsService, FruitsMapper],
})
export class FruitsModule {}
