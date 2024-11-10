import { Test, TestingModule } from '@nestjs/testing';
import { TripUserService } from './trip-user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { TripUser } from './entities/trip-user.entity';
import { UserService } from '../user/user.service';
import { TripService } from '../trip/trip.service';
import { TripCoordinateService } from '../trip-coordinate/trip-coordinate.service';
import { ConfigService } from '@nestjs/config';

describe('TripUserService', () => {
  let service: TripUserService;
  let tripUserRepository: Repository<TripUser>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripUserService,
        {
          provide: getRepositoryToken(TripUser),
          useClass: Repository,
        },
        {
          provide: UserService,
          useValue: {
            findUserById: jest.fn(), // mock de métodos que puedas necesitar
          },
        },
        {
          provide: TripService,
          useValue: {
            findTripById: jest.fn(),
          },
        },
        {
          provide: TripCoordinateService,
          useValue: {
            getCoordinatesByTripId: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {},
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                SMTP_HOST: 'smtp.example.com',
                SMTP_PORT: '587',
                SMTP_SECURE: 'false',
                SMTP_USER: 'user@example.com',
                SMTP_PASS: 'password',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<TripUserService>(TripUserService);
    tripUserRepository = module.get<Repository<TripUser>>(getRepositoryToken(TripUser));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
