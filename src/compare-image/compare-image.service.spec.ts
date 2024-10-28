import { Test, TestingModule } from '@nestjs/testing';
import { CompareImageService } from './compare-image.service';
import { UserService } from '../user/user.service';

describe('CompareImageService', () => {
  let service: CompareImageService;

  const mockUserService = {
    findOneById: jest.fn().mockResolvedValue({
      id: 'userId',
      imageDescriptor: 'mockImageDescriptorInBase64',
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompareImageService,
        { provide: UserService, useValue: mockUserService },],
    }).compile();

    service = module.get<CompareImageService>(CompareImageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
