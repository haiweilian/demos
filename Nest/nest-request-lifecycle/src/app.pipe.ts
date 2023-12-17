import { PipeTransform } from '@nestjs/common';

export class GlobalPipe implements PipeTransform {
  transform(value) {
    console.log('GlobalPipe: 全局管道');
    return value;
  }
}

export class ControllerPipe implements PipeTransform {
  transform(value) {
    console.log('ControllerPipe: 控制器管道');
    return value;
  }
}

export class RoutePipe implements PipeTransform {
  transform(value) {
    console.log('RoutePipe: 路由管道');
    return value;
  }
}

export class RouteParamPipe implements PipeTransform {
  constructor(private type) {}
  transform(value) {
    console.log('RouteParamPipe: 路由参数管道' + this.type);
    return value;
  }
}
