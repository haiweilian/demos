import { Test, TestingModule } from '@nestjs/testing';
import { UserPhotoService } from './user-photo.service';

describe('UserPhotoService', () => {
  let service: UserPhotoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserPhotoService],
    }).compile();

    service = module.get<UserPhotoService>(UserPhotoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
