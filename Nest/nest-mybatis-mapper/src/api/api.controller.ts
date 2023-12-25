import { Controller, Get, Query } from '@nestjs/common';
import { ApiService } from './api.service';

@Controller('api')
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Get()
  list(@Query() dto: any) {
    return this.apiService.list(dto);
  }

  @Get('sql')
  listsql(@Query() dto: any) {
    return this.apiService.listsql(dto);
  }

  @Get('xml')
  listxml(@Query() dto: any) {
    return this.apiService.listxml(dto);
  }
}
