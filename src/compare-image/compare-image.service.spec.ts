import { Test, TestingModule } from '@nestjs/testing';
import { CompareImageService } from './compare-image.service';

describe('CompareImageService', () => {
  let service: CompareImageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompareImageService],
    }).compile();

    service = module.get<CompareImageService>(CompareImageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
