import { Test, TestingModule } from '@nestjs/testing';
import { TripService } from './trip.service';
import { DataSource, In } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Trip } from './entities/trip.entity';
import { TripUserService } from '../trip-user/trip-user.service';
import { UserService } from '../user/user.service';
import { TripCoordinateService } from '../trip-coordinate/trip-coordinate.service';
import { TripUser, TripUserStatus, UserRole } from '../trip-user/entities/trip-user.entity';
import { User } from '../user/entities/user.entity';
import { TripCoordinate } from '../trip-coordinate/entities/trip-coordinate.entity';
import { ConfigModule } from '@nestjs/config';
import { CoordinateDto } from './dto/create-trip.dto';
import { ImgurService } from '../imgur/imgur.service';
import { Vehicle } from '../vehicle/entities/vehicle.entity';
import { VehicleService } from '../vehicle/vehicle.service';
jest.useFakeTimers().setSystemTime(new Date('2020-01-01'))

//TEST DATA & MOCKS
const mockCoordinates: CoordinateDto[] = [
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
];
const exampleTripDto = {
  id: 'testid',
  origin: 'testorigin',
  destination: 'testdestination',
  coordinates: mockCoordinates,
  startDate: new Date(),
  description: 'testdecription',
  estimatedCost: 999,
  maxPassengers: 3,
  userId: "testId",
  maxTolerableDistance: 5000,
  vehicleId: 'exampleVehicleId',
  imageUrl: "/src/assets/testImg.png"
};
const exampleCreateTrip = {
  origin: 'testorigin',
  destination: 'testdestination',
  startDate: new Date(),
  description: 'testdecription',
  estimatedCost: 999,
  maxPassengers: 3,
  maxTolerableDistance: exampleTripDto.maxTolerableDistance,
  vehicleId: 'exampleVehicleId',
  imageUrl: "/src/assets/testImg.png"
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
  imageUrl: "/src/assets/testImg.png"
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
  role: UserRole.DRIVER,
}

const exampleVehicle = {
  id: 'exampleVehicleId',
  model: 'Corolla',
  color: 'Red',
  plateNumber: 'ABC1234',
  year: 2020,
  owner: {
    id: 'exampleUserId',
    name: 'exampleName',
    surname: 'exampleSurname',
  },
};


const mockVehicleRepository = {
  findOneBy: jest.fn().mockResolvedValue(exampleVehicle),
  findOne: jest.fn().mockResolvedValue(exampleVehicle),
};

const mockManager = {
  save: jest.fn().mockResolvedValue(exampleTrip),
}
const mockImgurService = {
  uploadImage: jest.fn()
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
  create: jest.fn(),
  createQueryBuilder: jest.fn().mockImplementation(() => ({
    leftJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockResolvedValue(null),
    getMany: jest.fn().mockResolvedValue([exampleTrip]),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
  })),
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
      imports: [ConfigModule],
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
        {
          provide: ImgurService,
          useValue: mockImgurService
        },
        VehicleService,
        {
          provide: getRepositoryToken(Vehicle),
          useValue: mockVehicleRepository,
        },
      ],
    }).compile();
    dataSourceMock = module.get(DataSource);
    tripService = module.get<TripService>(TripService);
  });

  it('should be defined', () => {
    expect(tripService).toBeDefined();
  });
  it('should call tripRepository findAll when trip service "findAll" is called', async () => {
    const spyCreateQueryBuilder = jest.spyOn(mockTripRepository, 'createQueryBuilder');

    const result = await tripService.findAll({ origin: 'testorigin' });

    expect(spyCreateQueryBuilder).toHaveBeenCalledWith('trip');
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
        imageUrl: exampleTrip.imageUrl
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
  it('should call trip repository "findOne" when trip service calls "findOneById"', async () => {
    mockTripRepository.findOne.mockResolvedValueOnce(exampleTrip);
    jest.spyOn(mockTripRepository, 'findOne');
    await tripService.findOneById(exampleTrip.id);
    expect(mockTripRepository.findOne).toHaveBeenCalled();
  });
  it('should make corresponding calls when trip service calls "createTrip"', async () => {
    mockTripRepository.create.mockResolvedValueOnce(exampleTrip);
    jest.spyOn(mockTripRepository, 'create');
    jest.spyOn(mockQueryRunnerResult, 'startTransaction');
    jest.spyOn(mockQueryRunnerResult, 'release');
    jest.spyOn(mockManager, 'save');
    jest.spyOn(mockTripUserRepository, 'findOne');
    jest.spyOn(mockTripUserRepository, 'create');
    jest.spyOn(mockVehicleRepository, 'findOneBy')


    await tripService.createTrip(exampleTripDto);
    expect(dataSourceMock.createQueryRunner).toHaveBeenCalled();
    expect(mockQueryRunnerResult.startTransaction).toHaveBeenCalled();
    expect(mockManager.save).toHaveBeenCalledTimes(mockCoordinates.length + 2); //one for each trip coordinate, one for the trip and one for the tripUser
    expect(mockTripUserRepository.findOne).toHaveBeenCalledWith({
      where: { user: { id: exampleTripDto.userId }, trip: { startDate: exampleTrip.startDate }, status: In([TripUserStatus.Confirmed, TripUserStatus.Pending]) },
    });
    expect(mockTripUserRepository.create).toHaveBeenCalledWith({
      user: exampleUser,
      trip: exampleCreateTrip,
      joinDate: exampleTripDto.startDate,
      status: "confirmed",
      role: "driver",
      vehicle: {
        id: exampleVehicle.id,
        model: exampleVehicle.model,
        color: exampleVehicle.color,
        plateNumber: exampleVehicle.plateNumber,
        year: exampleVehicle.year,
        owner: {
          id: exampleVehicle.owner.id,
          name: exampleVehicle.owner.name,
          surname: exampleVehicle.owner.surname,
        },
      },
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
  it('should rollback transaction when a call fails', async () => {
    mockQueryRunnerResult.manager.save.mockRejectedValueOnce("Some save error");
    jest.spyOn(mockQueryRunnerResult, 'rollbackTransaction');

    expect(mockQueryRunnerResult.rollbackTransaction).toHaveBeenCalled();
  })

});
