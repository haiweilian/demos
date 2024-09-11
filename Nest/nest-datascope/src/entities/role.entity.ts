import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

/**
 * 角色信息表
 */
@Entity({ name: 'role' })
export class Role {
  @PrimaryGeneratedColumn({
    name: 'role_id',
    type: 'bigint',
    comment: '角色ID',
  })
  roleId: number;

  @Column({
    name: 'role_code',
    type: 'varchar',
    length: 50,
    comment: '角色编码',
  })
  roleCode: string;

  @Column({
    name: 'data_scope',
    type: 'char',
    length: 1,
    default: '1',
    comment: '数据范围',
  })
  dataScope: string;
}
