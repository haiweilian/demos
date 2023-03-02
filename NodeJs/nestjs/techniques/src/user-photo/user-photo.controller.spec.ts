import { Test, TestingModule } from '@nestjs/testing';
import { UserPhotoController } from './user-photo.controller';
import { UserPhotoService } from './user-photo.service';

describe('UserPhotoController', () => {
  let controller: UserPhotoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserPhotoController],
      providers: [UserPhotoService],
    }).compile();

    controller = module.get<UserPhotoController>(UserPhotoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
