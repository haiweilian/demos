import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const roles = Reflect.getMetadata('roles', context.getHandler());
    if (!roles) {
      return true;
    }

    const req = context.switchToHttp().getRequest<Request>();
    const role = req.header('role');
    if (roles.includes(role)) {
      return true;
    } else {
      throw new ForbiddenException('认证失败');
    }
  }
}
