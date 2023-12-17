import { Controller, Get } from '@nestjs/common';
import { User } from './user.decorator';

@Controller('custom-decorators')
export class CustomDecoratorsController {
  @Get()
  get(@User() user: string) {
    return {
      user,
    };
  }
}
