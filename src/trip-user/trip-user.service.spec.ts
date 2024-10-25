import { Test, TestingModule } from '@nestjs/testing';
import { TripUserService } from './trip-user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { TripUser } from './entities/trip-user.entity';
import { UserService } from '../user/user.service';
import { TripService } from '../trip/trip.service';
import { TripCoordinateService } from '../trip-coordinate/trip-coordinate.service';

describe('TripUserService', () => {
  let service: TripUserService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let tripUserRepository: Repository<TripUser>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TripUserService,
        {
          provide: getRepositoryToken(TripUser),
          useClass: Repository,
        },
        {
          provide: UserService,
          useValue: {},  //  agregar mocks aca
        },
        {
          provide: TripService,
          useValue: {},  //agregar mocks aca
        },
        {
          provide: TripCoordinateService,
          useValue: {},  //  agregar mocks aca
        },
        {
          provide: DataSource,
          useValue: {}, // Mock de DataSource
        },],
    }).compile();

    service = module.get<TripUserService>(TripUserService);
    tripUserRepository = module.get<Repository<TripUser>>(getRepositoryToken(TripUser));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});