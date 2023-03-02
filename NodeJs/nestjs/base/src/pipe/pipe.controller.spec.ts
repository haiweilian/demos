import { Test, TestingModule } from '@nestjs/testing';
import { PipeController } from './pipe.controller';

describe('PipeController', () => {
  let controller: PipeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PipeController],
    }).compile();

    controller = module.get<PipeController>(PipeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
