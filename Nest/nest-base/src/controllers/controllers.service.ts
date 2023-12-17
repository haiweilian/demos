import { Injectable } from '@nestjs/common';
import { CreateControllerDto } from './dto/create-controller.dto';
import { UpdateControllerDto } from './dto/update-controller.dto';

@Injectable()
export class ControllersService {
  create(createControllerDto: CreateControllerDto) {
    return 'This action adds a new controller';
  }

  findAll() {
    return `This action returns all controllers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} controller`;
  }

  update(id: number, updateControllerDto: UpdateControllerDto) {
    return `This action updates a #${id} controller`;
  }

  remove(id: number) {
    return `This action removes a #${id} controller`;
  }
}
