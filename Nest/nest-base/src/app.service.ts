import { Injectable } from '@nestjs/common';
import { ModulesService } from './modules/modules.service';

@Injectable()
export class AppService {
  constructor(private readonly modulesService: ModulesService) {}

  getHello(): string {
    this.modulesService.log();
    return 'Hello World!';
  }
}
