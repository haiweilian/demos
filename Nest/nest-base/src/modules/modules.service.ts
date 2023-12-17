import { Injectable } from '@nestjs/common';

@Injectable()
export class ModulesService {
  log() {
    console.log('模块');
  }
}
