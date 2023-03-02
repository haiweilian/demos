import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserPhotoDto } from './dto/create-user-photo.dto';
import { UpdateUserPhotoDto } from './dto/update-user-photo.dto';
import { UserPhoto } from './entities/user-photo.entity';

@Injectable()
export class UserPhotoService {
  // @InjectRepository(UserPhoto)
  // private usersPhotoRepository: Repository<UserPhoto>

  constructor(
    @InjectRepository(UserPhoto)
    private usersPhotoRepository: Repository<UserPhoto>,
  ) {}

  create(createUserPhotoDto: CreateUserPhotoDto) {
    return this.usersPhotoRepository.save(createUserPhotoDto);
  }

  findAll() {
    return `This action returns all userPhoto`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userPhoto`;
  }

  update(id: number, updateUserPhotoDto: UpdateUserPhotoDto) {
    return `This action updates a #${id} userPhoto`;
  }

  remove(id: number) {
    return `This action removes a #${id} userPhoto`;
  }
}
