import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { ApiMapper } from './api.mapper';

@Injectable()
export class ApiService {
  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    private apiMapper: ApiMapper,
  ) {}

  // 问题点：如果想把这段 sql 在工具里执行是很困难的，不得不在转化一遍
  list(dto: any) {
    const studentId = dto.studentId;
    const subjectId = dto.subjectId && dto.subjectId.split(',');
    const scoreSort = dto.scoreSort || 'DESC';

    // 创建查询全部的语句
    const query = this.entityManager
      .createQueryBuilder()
      .select([
        'sc.id id',
        'sc.score score',
        'st.name studentName',
        'su.name subjectName',
      ])
      .from('score', 'sc')
      .leftJoin('student', 'st', 'sc.studentId = st.id')
      .leftJoin('subject', 'su', 'sc.subjectId = su.id');

    // 添加条件查询，如果不传入是不能拼条件的
    if (studentId) {
      query.andWhere('sc.studentId = :studentId', { studentId });
    }
    if (Array.isArray(subjectId) && subjectId.length) {
      query.andWhere('sc.subjectId IN (:...subjectId)', { subjectId });
    }
    query.orderBy('sc.score', scoreSort);

    return query.getRawMany();
  }

  // 问题点：拼接参数时困难的，不得不拼接占位符和参数
  listsql(dto: any) {
    const studentId = dto.studentId;
    const subjectId = dto.subjectId && dto.subjectId.split(',');
    const scoreSort = dto.scoreSort || 'DESC';

    let query = `
      SELECT
        sc.id id,
        sc.score score,
        st.name studentName,
        su.name subjectName
      FROM
        score sc
        LEFT JOIN student st ON sc.studentId = st.id
        LEFT JOIN subject su ON sc.subjectId = su.id
        WHERE 1 = 1
    `;

    // 添加条件查询，如果不传入是不能拼条件的
    const parameters = [];
    if (studentId) {
      query += `AND sc.studentId = ? `;
      parameters.push(studentId);
    }
    if (Array.isArray(subjectId) && subjectId.length) {
      query += `AND sc.subjectId IN (${Array(subjectId.length)
        .fill('?')
        .join(',')}) `;
      parameters.push(...subjectId);
    }

    query += `ORDER BY sc.score ${scoreSort} `;

    return this.entityManager.query(query, parameters);
  }

  // 优化点：可以把 sql 提取到 xml 文件里，由单独的解析器去解析
  listxml(dto: any) {
    const studentId = dto.studentId || null;
    const subjectId = dto.subjectId && dto.subjectId.split(',');
    const scoreSort = dto.scoreSort || 'DESC';
    return this.apiMapper.listxml({
      studentId,
      subjectId,
      scoreSort,
    });
  }
}
