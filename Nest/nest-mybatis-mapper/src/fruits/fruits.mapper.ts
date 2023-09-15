import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import * as mybatisMapper from 'mybatis-mapper';
import { join } from 'path';

mybatisMapper.createMapper([join(__dirname, './fruits.mapper.xml')]);
const format = { language: 'sql', indent: '  ' } as const;

@Injectable()
export class FruitsMapper {
  constructor(@InjectEntityManager() private entityManager: EntityManager) {}

  async test() {
    const sql = mybatisMapper.getStatement('fruit', 'test', null, format);
    console.log(sql);

    const result = await this.entityManager.query(sql);
    return result;
  }
}
