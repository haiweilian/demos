import { Controller, Get, Param } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { Dept } from '../entities/dept.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataScope } from '../datascope.decorator';
import { DataScopeSql } from '../datascope-sql.decorator';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userService: UserService,
  ) {}

  // @Get()
  // list(@User() user) {
  //   let dsSql = '';
  //   if (user.dataScope === '5') {
  //     dsSql = `user.user_id = ${user.userId}`;
  //   }
  //   if (user.dataScope === '4') {
  //     dsSql = `dept.dept_id IN(SELECT dept_id FROM dept WHERE dept_id = ${user.deptId} OR FIND_IN_SET(${user.deptId}, ancestors))`;
  //   }

  //   this.userRepository
  //     .createQueryBuilder('user')
  //     .leftJoin(Dept, 'dept', 'dept.dept_id = user.dept_id')
  //     .where(dsSql)
  //     .getMany();
  // }

  @Get('users')
  @DataScope({
    deptAlias: 'dept',
    userAlias: 'user',
  })
  async list(@DataScopeSql() dataScopeSql: string) {
    console.log('dataScopeSql:', dataScopeSql);
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoin(Dept, 'dept', 'dept.dept_id = user.dept_id');

    if (dataScopeSql) {
      queryBuilder.andWhere(dataScopeSql); // 加上数据权限范围
    }

    console.log('queryBuilderSql:', queryBuilder.getSql());
    return queryBuilder.getMany();
  }

  @Get('update/:userId')
  @DataScope({
    deptAlias: 'dept',
    userAlias: 'user',
  })
  async update(
    @Param('userId') userId: string,
    @DataScopeSql() dataScopeSql: string,
  ) {
    console.log('dataScopeSql:', dataScopeSql);
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoin(Dept, 'dept', 'dept.dept_id = user.dept_id')
      .where('user.user_id = :userId', { userId }); // 再加上指定用户的条件

    if (dataScopeSql) {
      queryBuilder.andWhere(dataScopeSql); // 加上数据权限范围
    }

    console.log('queryBuilderSql:', queryBuilder.getSql());
    const count = await queryBuilder.getCount(); // 能查出有权限，不能查出无权限
    return count > 0 ? '有权限修改' : '无权限修改';
  }

  @Get('users2')
  async list2() {
    return this.userService.list2();
  }

  @Get('update2/:userId')
  async update2(@Param('userId') userId: string) {
    return this.userService.update2(userId);
  }
}
