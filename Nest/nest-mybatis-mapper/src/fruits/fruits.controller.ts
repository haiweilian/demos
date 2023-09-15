import { Controller, Get } from '@nestjs/common';
import { FruitsService } from './fruits.service';

@Controller('fruits')
export class FruitsController {
  constructor(private fruitsService: FruitsService) {}

  @Get('test')
  test() {
    return this.fruitsService.test();
  }

  @Get('testorm')
  testorm() {
    return this.fruitsService.testorm();
  }
}
