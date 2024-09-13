import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const DataScopeSql = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request['DATA_SCOPE_SQL'];
  },
);
