import { CanActivate } from '@nestjs/common';

export class GlobalGuard implements CanActivate {
  canActivate() {
    console.log('GlobalGuard: 全局守卫');
    return true;
  }
}

export class ControllerGuard implements CanActivate {
  canActivate() {
    console.log('ControllerGuard: 控制器守卫');
    return true;
  }
}

export class RouteGuard implements CanActivate {
  canActivate() {
    console.log('RouteGuard: 路由守卫');
    return true;
  }
}
