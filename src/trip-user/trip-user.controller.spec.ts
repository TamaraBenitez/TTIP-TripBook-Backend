import { Test, TestingModule } from '@nestjs/testing';
import { TripUserController } from './trip-user.controller';
import { TripUserService } from './trip-user.service';
import { JwtService } from '@nestjs/jwt';

describe('TripUserController', () => {
  let controller: TripUserController;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let tripUserService: TripUserService;

  beforeEach(async () => {
    const mockTripUserService = {
      registrationTripUser: jest.fn(),
      findTripsByUser: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn().mockReturnValue('mockJwtToken'),
      verify: jest.fn().mockReturnValue({ userId: 'a1234b5678c9d0e12345f6g7h8i9j0kl' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TripUserController],
      providers: [{ provide: TripUserService, useValue: mockTripUserService }, {
        provide: JwtService,
        useValue: mockJwtService,
      },],
    }).compile();

    controller = module.get<TripUserController>(TripUserController);
    tripUserService = module.get<TripUserService>(TripUserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
