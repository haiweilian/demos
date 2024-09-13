import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { DataScope } from '../datascope.decorator';
import { DataScopeService } from '../datascope.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataScopeService: DataScopeService,
  ) {}

  @DataScope({
    deptAlias: 'd',
    userAlias: 'u',
  })
  private dsBuilder() {
    const dataScopeSql = this.dataScopeService.sql(this.dsBuilder);
    console.log('dataScopeSql:', dataScopeSql);

    const queryBuilder = this.userRepository
      .createQueryBuilder('u')
      .leftJoin('dept', 'd', 'd.dept_id = u.dept_id');

    if (dataScopeSql) {
      queryBuilder.andWhere(dataScopeSql); // 加上数据权限范围
    }

    console.log('queryBuilderSql:', queryBuilder.getSql());
    return queryBuilder;
  }

  async list2() {
    return this.dsBuilder().getMany();
  }

  async update2(userId: string) {
    const count = await this.dsBuilder()
      .andWhere('u.user_id = :userId', { userId }) // 再加上指定用户的条件
      .getCount(); // 能查出有权限，不能查出无权限
    return count > 0 ? '有权限修改' : '无权限修改';
  }
}
