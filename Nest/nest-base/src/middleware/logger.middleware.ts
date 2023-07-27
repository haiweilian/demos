import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    const now = Date.now();
    console.log('Middleware', req.url);
    next();
    console.log('Middleware', Date.now() - now);
  }
}
