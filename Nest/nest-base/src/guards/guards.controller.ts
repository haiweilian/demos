import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

@Controller('guards')
// @UseGuards(RolesGuard)
export class GuardsController {
  @Get()
  @Roles('admin')
  // @UseGuards(RolesGuard)
  get() {
    return 'ok';
  }
}
