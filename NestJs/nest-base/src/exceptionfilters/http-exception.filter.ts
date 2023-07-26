import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
// import { ExceptionfiltersService } from './exceptionfilters.service';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  // constructor(private exceptionfiltersService: ExceptionfiltersService) {}
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const info = {
      code: status,
      path: request.path,
      message: exception.message,
    };
    // this.exceptionfiltersService.add(info); // 把错误信息保存到库里
    response.status(status).json(info);
  }
}
