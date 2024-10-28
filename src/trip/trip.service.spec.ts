import { Test, TestingModule } from '@nestjs/testing';
import { TripService } from './trip.service';
import { DataSource } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Trip } from './entities/trip.entity';
import { TripUserService } from '../trip-user/trip-user.service';
import { UserService } from '../user/user.service';
import { TripCoordinateService } from '../trip-coordinate/trip-coordinate.service';
import { TripUser, TripUserStatus, UserRole } from '../trip-user/entities/trip-user.entity';
import { User } from '../user/entities/user.entity';
import { TripCoordinate } from '../trip-coordinate/entities/trip-coordinate.entity';
jest.useFakeTimers().setSystemTime(new Date('2020-01-01'))

//TEST DATA & MOCKS
const exampleCreateTrip = {
  origin: 'testorigin',
  destination: 'testdestination',
  startDate: new Date(),
  description: 'testdecription',
  estimatedCost: 999,
  maxPassengers: 3
}
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
const exampleUser = {
  id: 'exampleUserId',
  name: 'exampleName',
  surname: 'exampleSurname',
};
const exampleTripUser = {
  user: exampleUser,
  trip: exampleTrip,
  status: TripUserStatus.Confirmed,
  role: UserRole.DRIVER ,
}
const exampleTripDto = {
  id: 'testid',
  origin: 'testorigin',
  destination: 'testdestination',
  startPoint:{
    latitude: 51.505,
    longitude: -0.09
  },
  endPoint:{
    latitude: 51.505,
    longitude: -0.09
  },
  startDate: new Date(),
  description: 'testdecription',
  estimatedCost: 999,
  maxPassengers: 3,
  userId: "testId"
};
const mockManager = {
  save: jest.fn().mockResolvedValue(exampleTrip),
}
const mockQueryRunnerResult = {
  connect: jest.fn(),
  startTransaction: jest.fn(),
  release: jest.fn(),
  rollbackTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  manager: mockManager
}
// @ts-ignore
export const dataSourceMockFactory: () => MockType<DataSource> = jest.fn(
  () => ({
    findAll: jest.fn(),
    createQueryRunner: jest.fn().mockImplementation(() => (mockQueryRunnerResult))
  }),
);
const mockTripRepository = {
  save: jest.fn(),
  find: jest.fn().mockResolvedValue([exampleTrip]),
  findOne: jest.fn().mockResolvedValue(exampleTrip),
  delete: jest.fn(),
  create: jest.fn()
};
const mockTripUserRepository = {
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
  create: jest.fn().mockResolvedValue(exampleTripUser)
};
const mockUserRepository = {
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn().mockResolvedValue(exampleUser),
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
  it('should create a trip', async () => {
    mockTripRepository.create.mockResolvedValueOnce(exampleTrip);
    jest.spyOn(mockTripRepository, 'create');
    jest.spyOn(mockQueryRunnerResult, 'startTransaction');
    jest.spyOn(mockQueryRunnerResult, 'release');
    jest.spyOn(mockManager, 'save');
    jest.spyOn(mockTripUserRepository, 'findOne');
    jest.spyOn(mockTripUserRepository, 'create');
    

    await tripService.createTrip(exampleTripDto);
    expect(dataSourceMock.createQueryRunner).toHaveBeenCalled();
    expect(mockQueryRunnerResult.startTransaction).toHaveBeenCalled();
    expect(mockManager.save).toHaveBeenCalledTimes(4);
    expect(mockTripUserRepository.findOne).toHaveBeenCalledWith({
      where: { user: { id: exampleTripDto.userId }, trip: { id: exampleTrip.id } },
    })
    expect(mockTripUserRepository.create).toHaveBeenCalledWith({
      user:exampleUser,
      trip:exampleCreateTrip,
      joinDate: new Date(),
      status:"confirmed",
      role:"driver"
    });
    expect(mockQueryRunnerResult.commitTransaction).toHaveBeenCalled();
    expect(mockQueryRunnerResult.release).toHaveBeenCalled();
    
  });
  it('should throw exception when user doesnt exist', async () => {
    mockUserRepository.findOneBy.mockResolvedValueOnce(null);

    await expect(tripService.createTrip(exampleTripDto)).rejects.toThrow(
      'El usuario no existe en la plataforma'
    );    
  });
  it('should rollback transaction when a call fails', async ()=>{
    mockQueryRunnerResult.manager.save.mockRejectedValueOnce("Some save error");
    jest.spyOn(mockQueryRunnerResult, 'rollbackTransaction');

    expect(mockQueryRunnerResult.rollbackTransaction).toHaveBeenCalled();
  })
});
