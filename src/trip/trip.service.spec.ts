import { Test, TestingModule } from '@nestjs/testing';
import { TripService } from './trip.service';
import { DataSource } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Trip } from './entities/trip.entity';
import { TripUserService } from '../trip-user/trip-user.service';
import { UserService } from '../user/user.service';
import { TripCoordinateService } from '../trip-coordinate/trip-coordinate.service';
import { TripUser } from '../trip-user/entities/trip-user.entity';
import { User } from '../user/entities/user.entity';
import { TripCoordinate } from '../trip-coordinate/entities/trip-coordinate.entity';
import { BadRequestException } from '@nestjs/common';

// @ts-ignore
export const dataSourceMockFactory: () => MockType<DataSource> = jest.fn(
  () => ({
    findAll: jest.fn(),
  }),
);
const exampleTrip = {
  id: 'testid',
  origin: 'testorigin',
  destination: 'testdestination',
  startDate: new Date(),
  description: 'testdecription',
  estimatedCost: 999,
  maxPassengers: 3,
  tripUsers: [],
};
const mockTripRepository = {
  save: jest.fn(),
  find: jest.fn().mockResolvedValue([exampleTrip]),
  findOne: jest.fn(),
  delete: jest.fn(),
};
const mockTripUserRepository = {
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
};
const mockUserRepository = {
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
};
const mockTropCoordinateRepository = {
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
};

export type MockType<T> = {
  [P in keyof T]?: jest.Mock<{}>;
};

describe('TripService', () => {
  let tripService: TripService;
  let tripCoordService: TripCoordinateService;
  let dataSourceMock: MockType<DataSource>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: DataSource, useFactory: dataSourceMockFactory },
        TripService,
        {
          provide: getRepositoryToken(Trip),
          useValue: mockTripRepository,
        },
        TripUserService,
        {
          provide: getRepositoryToken(TripUser),
          useValue: mockTripUserRepository,
        },
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        TripCoordinateService,
        {
          provide: getRepositoryToken(TripCoordinate),
          useValue: mockTropCoordinateRepository,
        },
      ],
    }).compile();
    dataSourceMock = module.get(DataSource);
    tripService = module.get<TripService>(TripService);
    tripCoordService = module.get<TripCoordinateService>(TripCoordinateService);
  });

  it('should be defined', () => {
    expect(tripService).toBeDefined();
  });
  it('should call tripRepository findAll', async () => {
    jest.spyOn(mockTripRepository, 'find');

    const result = await tripService.findAll();
    expect(mockTripRepository.find).toHaveBeenCalledWith({
      relations: ['tripUsers'],
    });
    expect(result).toEqual([
      {
        id: exampleTrip.id,
        origin: exampleTrip.origin,
        destination: exampleTrip.destination,
        startDate: exampleTrip.startDate,
        description: exampleTrip.description,
        estimatedCost: exampleTrip.estimatedCost,
        registrants: 0,
        maxPassengers: exampleTrip.maxPassengers,
      },
    ]);
  });
  it('should throw exception when findOneById returns null', async () => {
    mockTripRepository.findOne.mockResolvedValueOnce(null);
    jest.spyOn(mockTripRepository, 'findOne');
    await expect(tripService.findOneById(exampleTrip.id)).rejects.toThrow(
      'El viaje no existe en la plataforma'
    );
  });
  it('should findOneById', async () => {
    mockTripRepository.findOne.mockResolvedValueOnce(exampleTrip);
    jest.spyOn(mockTripRepository, 'findOne');
    await tripService.findOneById(exampleTrip.id);
    expect(mockTripRepository.findOne).toHaveBeenCalled();
  });
});
