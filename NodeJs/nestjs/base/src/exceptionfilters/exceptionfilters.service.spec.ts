import { Test, TestingModule } from '@nestjs/testing';
import { ExceptionfiltersService } from './exceptionfilters.service';

describe('ExceptionfiltersService', () => {
  let service: ExceptionfiltersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExceptionfiltersService],
    }).compile();

    service = module.get<ExceptionfiltersService>(ExceptionfiltersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
