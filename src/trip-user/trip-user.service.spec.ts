import { Test, TestingModule } from '@nestjs/testing';
import { TripUserService } from './trip-user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { TripUser, TripUserStatus } from './entities/trip-user.entity';
import { UserService } from '../user/user.service';
import { TripService } from '../trip/trip.service';
import { TripCoordinateService } from '../trip-coordinate/trip-coordinate.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Trip } from 'src/trip/entities/trip.entity';

describe('TripUserService', () => {
  let service: TripUserService;
  let tripUserRepository: Repository<TripUser>;
  let tripService: TripService

  const createQueryBuilderMock = {
    innerJoinAndSelect: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    getMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripUserService,
        {
          provide: getRepositoryToken(TripUser),
          useValue: {
            createQueryBuilder: jest.fn(() => createQueryBuilderMock),
            findOne: jest.fn(),
            save: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            findUserById: jest.fn(),
          },
        },
        {
          provide: TripService,
          useValue: {
            findTripById: jest.fn(),
            findTripEntityById: jest.fn()
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
    service['sendEmail'] = jest.fn();
    tripService = module.get<TripService>(TripService);

  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRequestDetails', () => {

    it('debe lanzar BadRequestException si no se encuentra el trip', async () => {
      const tripUserId = 'trip-user-id';

      createQueryBuilderMock.getOne
        .mockResolvedValueOnce({
          id: tripUserId,
          status: TripUserStatus.Pending,
        })
        .mockResolvedValueOnce(null);

      await expect(service.getRequestDetails(tripUserId, 'invalid-tripId')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('rejectRequest', () => {
    it('should throw NotFoundException when tripUser is not found', async () => {
      jest.spyOn(tripUserRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(service.rejectRequest('nonexistent-id', 'No reason')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when tripUser status is not Pending', async () => {
      const tripUserMock = {
        id: 'existing-id',
        status: TripUserStatus.Confirmed,
        user: { email: 'user@example.com', name: 'User' },
        trip: { origin: 'Origin', destination: 'Destination' },
      } as TripUser;

      jest.spyOn(tripUserRepository, 'findOne').mockResolvedValueOnce(tripUserMock);

      await expect(service.rejectRequest('existing-id', 'No reason')).rejects.toThrow(BadRequestException);
    });

    it('should update status to Rejected and call sendEmail when tripUser is Pending', async () => {
      const tripUserMock = {
        id: 'pending-id',
        status: TripUserStatus.Pending,
        user: { email: 'user@example.com', name: 'User' },
        trip: { origin: 'Origin', destination: 'Destination' },
      } as TripUser;

      jest.spyOn(tripUserRepository, 'findOne').mockResolvedValueOnce(tripUserMock);
      jest.spyOn(tripUserRepository, 'save').mockResolvedValueOnce({ ...tripUserMock, status: TripUserStatus.Rejected });

      const result = await service.rejectRequest('pending-id', 'Reason for rejection');


      expect(tripUserMock.status).toBe(TripUserStatus.Rejected);

      expect(result).toEqual({
        message: 'La solicitud ha sido rechazada.',
        status: TripUserStatus.Rejected,
      });

      expect(service['sendEmail']).toHaveBeenCalledWith(
        tripUserMock.user.email,
        tripUserMock.user.name,
        'rejected',
        tripUserMock.trip.origin,
        tripUserMock.trip.destination,
        'Reason for rejection'
      );
    });
  });

  describe('acceptRequest', () => {
    it('should throw NotFoundException when tripUser is not found', async () => {
      jest.spyOn(tripUserRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(service.acceptRequest('nonexistent-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when tripUser status is not Pending', async () => {
      const tripUserMock = {
        id: 'existing-id',
        status: TripUserStatus.Confirmed,
        user: { email: 'user@example.com', name: 'User' },
        trip: { id: 'trip-id', origin: 'Origin', destination: 'Destination', maxPassengers: 3 },
      } as TripUser;

      jest.spyOn(tripUserRepository, 'findOne').mockResolvedValueOnce(tripUserMock);

      await expect(service.acceptRequest('existing-id')).rejects.toThrow(BadRequestException);
    });

    it('should reject the request when maxPassengers is reached', async () => {
      const tripUserMock = {
        id: 'pending-id',
        status: TripUserStatus.Pending,
        user: { email: 'user@example.com', name: 'User' },
        trip: { id: 'trip-id', origin: 'Origin', destination: 'Destination', maxPassengers: 3 },
      } as TripUser;

      jest.spyOn(tripUserRepository, 'findOne').mockResolvedValueOnce(tripUserMock);
      jest.spyOn(tripUserRepository, 'count').mockResolvedValueOnce(4);
      jest.spyOn(tripUserRepository, 'save').mockResolvedValueOnce({
        ...tripUserMock,
        status: TripUserStatus.Rejected,
      });

      const result = await service.acceptRequest('pending-id');

      expect(tripUserMock.status).toBe(TripUserStatus.Rejected);
      expect(result).toEqual({
        message: 'La solicitud ha sido rechazada por falta de espacio.',
        status: TripUserStatus.Rejected,
      });
      expect(service['sendEmail']).toHaveBeenCalledWith(
        tripUserMock.user.email,
        tripUserMock.user.name,
        'rejected',
        tripUserMock.trip.origin,
        tripUserMock.trip.destination
      );
    });

    it('should accept the request when maxPassengers is not reached', async () => {
      const tripUserMock = {
        id: 'pending-id',
        status: TripUserStatus.Pending,
        user: { email: 'user@example.com', name: 'User' },
        trip: { id: 'trip-id', origin: 'Origin', destination: 'Destination', maxPassengers: 3 },
      } as TripUser;

      jest.spyOn(tripUserRepository, 'findOne').mockResolvedValueOnce(tripUserMock);
      jest.spyOn(tripUserRepository, 'count').mockResolvedValueOnce(2);
      jest.spyOn(tripUserRepository, 'save').mockResolvedValueOnce({
        ...tripUserMock,
        status: TripUserStatus.Confirmed,
      });

      const result = await service.acceptRequest('pending-id');

      expect(tripUserMock.status).toBe(TripUserStatus.Confirmed);
      expect(result).toEqual({
        message: 'La solicitud ha sido aprobada.',
        status: TripUserStatus.Confirmed,
      });
      expect(service['sendEmail']).toHaveBeenCalledWith(
        tripUserMock.user.email,
        tripUserMock.user.name,
        'approved',
        tripUserMock.trip.origin,
        tripUserMock.trip.destination
      );
    });
  });

});
