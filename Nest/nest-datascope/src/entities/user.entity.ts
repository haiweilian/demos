import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

/**
 * 用户信息表
 */
@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn({
    name: 'user_id',
    type: 'bigint',
    comment: '用户ID',
  })
  userId: number;

  @Column({
    name: 'dept_id',
    type: 'bigint',
    comment: '部门ID',
  })
  deptId?: number;

  @Column({
    name: 'user_name',
    type: 'varchar',
    length: 50,
    comment: '用户账号',
  })
  userName: string;
}
