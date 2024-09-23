import { Test, TestingModule } from '@nestjs/testing';
import { Pdf417DecoderService } from './pdf417-decoder.service';

describe('Pdf417DecoderService', () => {
  let service: Pdf417DecoderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Pdf417DecoderService],
    }).compile();

    service = module.get<Pdf417DecoderService>(Pdf417DecoderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
