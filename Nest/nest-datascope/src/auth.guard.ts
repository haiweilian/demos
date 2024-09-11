import { CanActivate, ExecutionContext } from '@nestjs/common';

export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // 管理员
    request.user = {
      userId: 1,
      roleId: 1,
      deptId: 1,
    };

    // 经理
    // request.user = {
    //   userId: 2,
    //   roleId: 2,
    //   deptId: 2,
    //   dataScope: '4',
    // };

    // 员工
    // request.user = {
    //   userId: 3,
    //   roleId: 3,
    //   deptId: 20,
    //   dataScope: '5',
    // };

    return true;
  }
}
