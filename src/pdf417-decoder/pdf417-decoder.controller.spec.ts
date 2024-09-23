import { Test, TestingModule } from '@nestjs/testing';
import { Pdf417DecoderController } from './pdf417-decoder.controller';

describe('Pdf417DecoderController', () => {
  let controller: Pdf417DecoderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Pdf417DecoderController],
    }).compile();

    controller = module.get<Pdf417DecoderController>(Pdf417DecoderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
