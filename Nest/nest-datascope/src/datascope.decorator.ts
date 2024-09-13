import { SetMetadata } from '@nestjs/common';

export interface TableAlias {
  deptAlias: string;
  userAlias: string;
}

export const DataScope = (tableAlias: TableAlias) => {
  return SetMetadata('DATA_SCOPE_METADATA', tableAlias);
};
