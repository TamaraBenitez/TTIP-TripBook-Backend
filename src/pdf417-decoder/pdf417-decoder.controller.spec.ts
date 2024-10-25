import { Test, TestingModule } from '@nestjs/testing';
import { Pdf417DecoderController } from './pdf417-decoder.controller';
import { Pdf417DecoderService } from './pdf417-decoder.service';

describe('Pdf417DecoderController', () => {
  let controller: Pdf417DecoderController;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let decoderService: Pdf417DecoderService

  beforeEach(async () => {
    const mockDecoderService = {
      decodePdf417Dni: jest.fn(),
      decodePdf417License: jest.fn()
    }
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Pdf417DecoderController],
      providers: [{
        provide: Pdf417DecoderService, useValue: mockDecoderService

      }]
    }).compile();

    controller = module.get<Pdf417DecoderController>(Pdf417DecoderController);
    decoderService = module.get<Pdf417DecoderService>(Pdf417DecoderService)
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
