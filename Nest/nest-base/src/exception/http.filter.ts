import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpFilter implements ExceptionFilter {
  catch(exception: Error | HttpException, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();

    const code =
      exception instanceof HttpException ? exception.getStatus() : 500;

    res.json({
      code,
      message: exception.message,
    });
  }
}
