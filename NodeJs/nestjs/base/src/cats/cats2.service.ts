import { Injectable } from '@nestjs/common';
import { Cat } from './cats.interface';

// @Injectable() 附加有元数据，因此 Nest 知道这个类是一个 Nest provide
@Injectable()
export class Cats2Service {
  private readonly cats: Cat[] = [];

  create(cat: Cat) {
    this.cats.push(cat);
  }

  findAll(): Cat[] {
    return this.cats;
  }
}
