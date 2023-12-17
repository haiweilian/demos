import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: any, res: any, next: (error?: any) => void) {
    const now = Date.now();
    console.log('Middleware Class', req.url);
    next();
    console.log('Middleware Class', Date.now() - now);
  }
}
