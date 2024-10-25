import { Test, TestingModule } from '@nestjs/testing';
import { TripUserController } from './trip-user.controller';
import { TripUserService } from './trip-user.service';

describe('TripUserController', () => {
  let controller: TripUserController;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let tripUserService: TripUserService;

  beforeEach(async () => {
    const mockTripUserService = {
      registrationTripUser: jest.fn(),
      findTripsByUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TripUserController],
      providers: [{ provide: TripUserService, useValue: mockTripUserService },],
    }).compile();

    controller = module.get<TripUserController>(TripUserController);
    tripUserService = module.get<TripUserService>(TripUserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
