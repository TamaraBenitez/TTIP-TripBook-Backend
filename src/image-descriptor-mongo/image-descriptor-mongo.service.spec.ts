import { Test, TestingModule } from '@nestjs/testing';
import { ImageDescriptorMongoService } from './image-descriptor-mongo.service';

describe('ImageDescriptorMongoService', () => {
  let service: ImageDescriptorMongoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImageDescriptorMongoService],
    }).compile();

    service = module.get<ImageDescriptorMongoService>(ImageDescriptorMongoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
