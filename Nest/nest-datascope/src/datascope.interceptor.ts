import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TableAlias } from './datascope.decorator';

@Injectable()
export class DataScopeInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}
  intercept(context: ExecutionContext, next: CallHandler) {
    // 获取别名配置
    const alias: TableAlias = this.reflector.get(
      'DATA_SCOPE_METADATA',
      context.getHandler(),
    );
    if (!alias) return next.handle();

    // 获取用户信息
    const request = context.switchToHttp().getRequest();
    const { deptAlias, userAlias } = alias;
    const { userId, roleId, deptId, dataScope } = request.user;
    const isAdmin = userId === 1;

    // 生成数据范围SQL
    let sqlString = '';
    if (isAdmin || dataScope === '1') {
      // 1.全部数据权限：不限制查询条件
      sqlString = '';
    } else if (dataScope === '2') {
      // 2.自定数据权限：从 `sys_role_dept` 表中查出角色分配的部门，再通过 `IN` 查找多个部门的数据
      sqlString = `${deptAlias}.dept_id IN(SELECT dept_id from role_dept WHERE role_id = ${roleId})`;
    } else if (dataScope === '3') {
      // 3.部门数据权限：根据 `dept_id` 查询本部门的数据
      sqlString = `${deptAlias}.dept_id = ${deptId}`;
    } else if (dataScope === '4') {
      // 4.部门及以下数据权限：从 `sys_dept` 表中查出本部门和子部门，再通过 `IN` 查找多个部门的数据
      sqlString = `${deptAlias}.dept_id IN(SELECT dept_id FROM dept WHERE dept_id = ${deptId} OR FIND_IN_SET(${deptId}, ancestors))`;
    } else if (dataScope === '5') {
      // 5.仅本人数据权限：根据 `user_id` 查询本人的数据
      sqlString = `${userAlias}.user_id = ${userId}`;
    }

    // 保存在请求中
    request['DATA_SCOPE_SQL'] = sqlString;

    return next.handle();
  }
}
