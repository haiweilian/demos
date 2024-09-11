import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

/**
 * 部门表
 */
@Entity({ name: 'dept' })
export class Dept {
  @PrimaryGeneratedColumn({
    name: 'dept_id',
    type: 'bigint',
    comment: '部门ID',
  })
  deptId: number;

  @Column({
    name: 'parent_id',
    type: 'bigint',
    default: 0,
    comment: '父部门ID',
  })
  parentId: number;

  @Column({
    name: 'ancestors',
    type: 'varchar',
    length: 200,
    default: '0',
    comment: '祖级列表',
  })
  ancestors: string;

  @Column({
    name: 'dept_name',
    type: 'varchar',
    length: 50,
    comment: '部门名称',
  })
  deptName: string;
}
