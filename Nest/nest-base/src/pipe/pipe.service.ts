import { Injectable } from '@nestjs/common';
import { CreatePipeDto } from './dto/create-pipe.dto';
import { UpdatePipeDto } from './dto/update-pipe.dto';

@Injectable()
export class PipeService {
  create(createPipeDto: CreatePipeDto) {
    return 'This action adds a new pipe';
  }

  findAll() {
    return `This action returns all pipe`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pipe`;
  }

  update(id: number, updatePipeDto: UpdatePipeDto) {
    return `This action updates a #${id} pipe`;
  }

  remove(ids: number[]) {
    return `This action removes a #${ids} pipe`;
  }
}
