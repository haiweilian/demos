import { Test, TestingModule } from '@nestjs/testing';
import { ExceptionfiltersController } from './exceptionfilters.controller';

describe('ExceptionfiltersController', () => {
  let controller: ExceptionfiltersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExceptionfiltersController],
    }).compile();

    controller = module.get<ExceptionfiltersController>(ExceptionfiltersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
