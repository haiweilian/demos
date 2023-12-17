import { Controller, Get } from '@nestjs/common';
import { CustomProvidersService } from './custom-providers.service';

@Controller('custom-providers')
export class CustomProvidersController {
  constructor(
    private readonly customProvidersService: CustomProvidersService,
  ) {}

  @Get()
  config() {
    return this.customProvidersService.config();
  }
}
