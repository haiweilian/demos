import { Injectable } from '@nestjs/common';
import { FruitsMapper } from './fruits.mapper';
import { InjectRepository } from '@nestjs/typeorm';
import { FruitsEntity } from './fruits.entity';
import { LessThan, Repository } from 'typeorm';

@Injectable()
export class FruitsService {
  constructor(
    private fruitsMapper: FruitsMapper,

    @InjectRepository(FruitsEntity)
    private fruitsRepository: Repository<FruitsEntity>,
  ) {}

  test() {
    return this.fruitsMapper.test();
  }

  testorm() {
    return this.fruitsRepository.find({
      where: {
        category: 'apple',
        price: LessThan(60),
      },
    });
  }
}
