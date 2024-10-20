import { Test, TestingModule } from '@nestjs/testing';
import { CompareImageController } from './compare-image.controller';

describe('CompareImageController', () => {
  let controller: CompareImageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompareImageController],
    }).compile();

    controller = module.get<CompareImageController>(CompareImageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
