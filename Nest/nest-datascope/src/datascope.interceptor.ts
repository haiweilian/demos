import { Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TableAlias } from './datascope.decorator';

// 授权通过后可做数据权限
@Injectable()
export class DataScopeInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}
  intercept(context, next) {
    // 获取别名配置
    const alias: TableAlias = this.reflector.get(
      'DATASCOPE_METADATA',
      context.getHandler(),
    );
    if (!alias) return next.handle();

    const request = context.switchToHttp().getRequest();
    const { userId, roleId, deptId, dataScope } = request.user;
    const isAdmin = userId === 1;

    let sqlString = '';
    if (isAdmin || dataScope === '1') {
      // -- 1. 全部数据权限
      // -- 不限制条件
      sqlString = '';
    } else if (dataScope === '2') {
      // -- 2. 自定义数据权限
      // -- 从 `角色部门表` 查出角色分配的部门，再通过 in 查找多个部门的数据
      sqlString = `${alias.deptAlias}.dept_id IN(SELECT dept_id from role_dept WHERE role_id = ${roleId})`;
    } else if (dataScope === '3') {
      // -- 3. 本部门数据权限
      // -- 根据自身分配的部门，查询此部门的数据
      sqlString = `${alias.deptAlias}.dept_id = ${deptId}`;
    } else if (dataScope === '4') {
      // -- 4. 本部门及以下数据权限
      // -- 查询自身部门id 和 以下部门id，再通过 in 查找多个部门的数据
      sqlString = `${alias.deptAlias}.dept_id IN(SELECT dept_id FROM dept WHERE dept_id = ${deptId} OR FIND_IN_SET(${deptId}, ancestors))`;
    } else if (dataScope === '5') {
      // -- 5. 仅本人数据数据权限
      // -- 根据 user_id 查询数据
      sqlString = `${alias.userAlias}.user_id = ${userId}`;
    }
    request.dataScopeSql = sqlString ? '(' + sqlString + ')' : '1 = 1'; // 如果不想再程序中判断为空的话可以写死 1 = 1，以避免语法错误

    return next.handle();
  }
}
