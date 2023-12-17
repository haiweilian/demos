import { Inject, forwardRef } from '@nestjs/common';
import { BService } from './b.service';

export class AService {
  constructor(@Inject(forwardRef(() => BService)) private bService: BService) {
    this.bService.b();
  }

  a() {
    console.log('aaaaaaaaaaa');
  }
}
