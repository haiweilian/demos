import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { MybatisService } from '../mybatis.service';

@Injectable()
export class ApiMapper {
  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    private mybatisService: MybatisService,
  ) {}

  listxml(dto: any) {
    const sql = this.mybatisService.getSql('api', 'listxml', dto);
    return this.entityManager.query(sql);
  }
}
