import { Controller, Get, Param } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { Dept } from '../entities/dept.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataScope } from 'src/datascope.decorator';
import { DataScopeSql } from 'src/datascope-sql.decorator';

@Controller()
export class DataScopeController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Get('users1')
  @DataScope()
  getUsers2(@DataScopeSql() dataScopeSql: string) {
    console.log('dataScopeSql', dataScopeSql);
    console.log(
      this.userRepository
        .createQueryBuilder('user')
        .leftJoin(Dept, 'dept', 'dept.dept_id = user.dept_id')
        .where(dataScopeSql)
        .getSql(),
    );

    // const query = this.userRepository
    //   .createQueryBuilder('user')
    //   .leftJoin(Dept, 'dept', 'dept.dept_id = user.dept_id');
    // if (dataScopeSql) {
    //   query.where(dataScopeSql);
    // }
    // return query.getMany();

    return this.userRepository
      .createQueryBuilder('user')
      .leftJoin(Dept, 'dept', 'dept.dept_id = user.dept_id')
      .where(dataScopeSql)
      .getMany();
  }

  @Get('users2')
  @DataScope({
    userAlias: 'u',
    deptAlias: 'd',
  })
  getUsers1(@DataScopeSql() dataScopeSql: string) {
    console.log('dataScopeSql', dataScopeSql);
    console.log(
      this.userRepository
        .createQueryBuilder('u')
        .leftJoin(Dept, 'd', 'd.dept_id = d.dept_id')
        .where(dataScopeSql)
        .getSql(),
    );
    return this.userRepository
      .createQueryBuilder('u')
      .leftJoin(Dept, 'd', 'd.dept_id = u.dept_id')
      .where(dataScopeSql)
      .getMany();
  }

  @Get('update/:userId')
  @DataScope()
  async update(
    @Param('userId') userId: string,
    @DataScopeSql() dataScopeSql: string,
  ) {
    const count = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin(Dept, 'dept', 'dept.dept_id = user.dept_id')
      .where(dataScopeSql) // 当前用户可查询的数据列表
      .andWhere('user.user_id = :userId', { userId }) // 再加上指定用户的条件
      .getCount(); // 能查出有权限，不能查出无权限

    return count > 0 ? '有权限修改' : '无权限修改';
  }
}
