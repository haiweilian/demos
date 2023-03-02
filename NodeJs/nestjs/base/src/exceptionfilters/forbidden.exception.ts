import { HttpException, HttpStatus } from '@nestjs/common';

export class ForbiddenException extends HttpException {
  constructor() {
    super('自定义的错误信息', HttpStatus.FORBIDDEN);
  }
}
