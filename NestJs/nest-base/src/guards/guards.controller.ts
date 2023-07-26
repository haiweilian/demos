import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from './roles.decorator';

@Controller('guards')
// @UseGuards(RolesGuard)
export class GuardsController {
  @Get('/user')
  @Roles('admin')
  index() {
    return {
      name: 'lian',
    };
  }
}
