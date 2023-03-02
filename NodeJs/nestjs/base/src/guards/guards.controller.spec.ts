import { Test, TestingModule } from '@nestjs/testing';
import { GuardsController } from './guards.controller';

describe('GuardsController', () => {
  let controller: GuardsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GuardsController],
    }).compile();

    controller = module.get<GuardsController>(GuardsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
