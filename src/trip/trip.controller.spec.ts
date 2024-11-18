import { Test, TestingModule } from '@nestjs/testing';
import { TripController } from './trip.controller';
import { TripService } from './trip.service';
import { v4 as uuidv4 } from 'uuid';
import { CreateTripDto } from './dto/create-trip.dto';


const tripId1 = uuidv4();

const testTripDto: CreateTripDto = {
  origin: 'City A',
  destination: 'City B',
  coordinates: [
    {
      "latitude": -29.431193,
      "longitude": -66.86824
    },
    {
      "latitude": -33.282899,
      "longitude": -66.301932
    },
    {
      "latitude": -34.598132,
      "longitude": -60.940053
    },
    {
      "latitude": -37.326843,
      "longitude": -59.143076
    }
  ],
  startDate: new Date('2024-11-01T09:00:00Z'),
  description: 'A trip from City A to City B',
  estimatedCost: 100.50,
  maxPassengers: 4,
  userId: 'a1234b5678c9d0e12345f6g7h8i9j0kl',
  maxTolerableDistance: 5000
};


describe('TripController', () => {
  let controller: TripController;

  const tripService = {
    provide: TripService,
    useValue: {
      findAll: jest.fn(),
      findOneById: jest.fn(),
      createTrip: jest.fn(),
    },
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TripController],
      providers: [
        tripService
      ],
      exports: [TripService],
    }).compile();

    controller = module.get<TripController>(TripController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  it('should call TripService findAll', async () => {
    jest.spyOn(tripService.useValue, 'findAll');
    await controller.findAll({});
    expect(tripService.useValue.findAll).toHaveBeenCalled()
  });
  it('should call TripService findOneById', async () => {
    jest.spyOn(tripService.useValue, 'findOneById');
    await controller.findOneById(tripId1);
    expect(tripService.useValue.findOneById).toHaveBeenCalled()
  });
  it('should call TripService create', async () => {
    jest.spyOn(tripService.useValue, 'createTrip');
    await controller.create(testTripDto);
    expect(tripService.useValue.createTrip).toHaveBeenCalled()
  });
});
