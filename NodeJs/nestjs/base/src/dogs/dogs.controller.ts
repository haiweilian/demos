import { Controller, Get } from '@nestjs/common';
import { CatsService } from '../cats/cats.service';

@Controller('dogs')
export class DogsController {
  constructor(private catsService: CatsService) {}

  @Get('/all')
  getAll() {
    return this.catsService.findAll();
  }
}
