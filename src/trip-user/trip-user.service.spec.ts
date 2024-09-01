import { Test, TestingModule } from '@nestjs/testing';
import { TripUserService } from './trip-user.service';

describe('TripUserService', () => {
  let service: TripUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TripUserService],
    }).compile();

    service = module.get<TripUserService>(TripUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
