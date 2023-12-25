import { Module } from '@nestjs/common';
import { ApiService } from './api.service';
import { ApiController } from './api.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Score } from 'src/entities/score.entity';
import { Student } from 'src/entities/student.entity';
import { Subject } from 'typeorm/persistence/Subject';
import { MybatisService } from 'src/mybatis.service';
import { ApiMapper } from './api.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([Score, Student, Subject])],
  controllers: [ApiController],
  providers: [ApiService, ApiMapper, MybatisService],
})
export class ApiModule {}
