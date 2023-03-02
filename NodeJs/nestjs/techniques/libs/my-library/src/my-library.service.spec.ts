import { Test, TestingModule } from '@nestjs/testing';
import { MyLibraryService } from './my-library.service';

describe('MyLibraryService', () => {
  let service: MyLibraryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MyLibraryService],
    }).compile();

    service = module.get<MyLibraryService>(MyLibraryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
