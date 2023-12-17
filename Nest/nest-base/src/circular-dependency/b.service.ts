import { Inject, forwardRef } from '@nestjs/common';
import { AService } from './a.service';

export class BService {
  constructor(@Inject(forwardRef(() => AService)) private aService: AService) {
    this.aService.a();
  }

  b() {
    console.log('bbbbbbbbbbb');
  }
}
