import { Test, TestingModule } from '@nestjs/testing';
import { TripUserController } from './trip-user.controller';
import { TripUserService } from './trip-user.service';

describe('TripUserController', () => {
  let controller: TripUserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TripUserController],
      providers: [TripUserService],
    }).compile();

    controller = module.get<TripUserController>(TripUserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
