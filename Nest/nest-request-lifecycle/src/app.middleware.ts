import { NestMiddleware } from '@nestjs/common';

export const GlobalMiddleware = (req, res, next) => {
  console.log('GlobalMiddleware: 全局绑定中间件');
  next();
};

export class Modulemiddleware implements NestMiddleware {
  use(req, res, next) {
    console.log('Modulemiddleware: 模块绑定中间件');
    next();
  }
}
