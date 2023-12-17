import { Controller, Get, Inject } from '@nestjs/common';

@Controller('dynamic-modules')
export class DynamicModulesController {
  @Inject('config') private readonly config;

  @Get()
  get() {
    return this.config;
  }
}
