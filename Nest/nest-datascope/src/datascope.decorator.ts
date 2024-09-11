import { SetMetadata } from '@nestjs/common';

export class TableAlias {
  deptAlias?: string = 'dept';
  userAlias?: string = 'user';
}

export const DataScope = (tableAlias?: TableAlias) => {
  return SetMetadata(
    'DATASCOPE_METADATA',
    Object.assign(new TableAlias(), tableAlias),
  );
};
