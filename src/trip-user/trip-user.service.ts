import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTripUserDto } from './dto/create-trip-user.dto';
import {
  TripUser,
  TripUserStatus,
  UserRole,
} from './entities/trip-user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, QueryRunner, Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { TripService } from '../trip/trip.service';
import { ListTripResponseDto } from '../trip/dto/list-trip.dto';
import { Trip } from '../trip/entities/trip.entity';
import { TripCoordinate } from '../trip-coordinate/entities/trip-coordinate.entity';
import { TripCoordinateService } from '../trip-coordinate/trip-coordinate.service';
import { CreateTripWithOtherCoordinates } from './dto/create-trip-user-with-other-coordinates.dto';

@Injectable()
export class TripUserService {
  constructor(
    @InjectRepository(TripUser)
    private readonly tripUserRepository: Repository<TripUser>,
    private readonly userService: UserService,
    @Inject(forwardRef(() => TripService))
    private readonly tripService: TripService,
    private readonly dataSource: DataSource,
    private readonly tripCoordinateService: TripCoordinateService,
  ) {}

  async registrationTripUser(
    createTripUserDto: CreateTripUserDto,
    tripDetails?: Trip,
    queryRunner?: QueryRunner,
  ) {
    const { userId } = createTripUserDto;
    let trip = tripDetails;

    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new NotFoundException('El usuario no existe en la plataforma');
    }
    const conflictingEnrollment = await this.tripUserRepository.findOne({
      where: {
        user: { id: userId },
        trip: { startDate: trip.startDate },
        status: In([TripUserStatus.Confirmed, TripUserStatus.Pending]),
      },
    });
    if (conflictingEnrollment) {
      throw new BadRequestException(
        'El usuario ya está inscripto en otro viaje en la misma fecha',
      );
    }
    try {
      const tripUser = this.tripUserRepository.create({
        user: user,
        trip: trip,
        joinDate: new Date(),
        status: TripUserStatus.Confirmed,
        role: UserRole.DRIVER,
      });

      await queryRunner.manager.save(tripUser);

      return tripUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error);
    } finally {
      await queryRunner.release();
    }
  }

  async registerPassengerWithOtherCoordinates(
    createPassengerDto: CreateTripWithOtherCoordinates,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    const { userId, tripId, latitude, longitude } = createPassengerDto;
    try {
      const existingEnrollment = await this.tripUserRepository.findOne({
        where: { user: { id: userId }, trip: { id: tripId } },
      });
      if (existingEnrollment) {
        throw new BadRequestException(
          'El usuario ya está inscripto en este viaje',
        );
      }

      const user = await this.userService.findOneById(userId);
      if (!user) {
        throw new NotFoundException('El usuario no existe en la plataforma');
      }

      const trip = await this.tripService.findTripEntityById(tripId);
      if (!trip) {
        throw new NotFoundException('El viaje no existe en la plataforma');
      }

      const currentPassengersCount = await this.tripUserRepository.count({
        where: { trip: { id: tripId } },
      });
      if (currentPassengersCount >= trip.maxPassengers) {
        throw new BadRequestException(
          'El viaje ha alcanzado su límite máximo de pasajeros',
        );
      }

      const conflictingEnrollment = await this.tripUserRepository.findOne({
        where: {
          user: { id: userId },
          trip: { startDate: trip.startDate },
          status: In([TripUserStatus.Confirmed, TripUserStatus.Pending]),
        },
      });
      if (conflictingEnrollment) {
        throw new BadRequestException(
          'El usuario ya está inscripto en otro viaje en la misma fecha',
        );
      }

      const tripUser = this.tripUserRepository.create({
        user: user,
        trip: trip,
        joinDate: new Date(),
        status: TripUserStatus.Pending,
        role: UserRole.PASSENGER,
      });

      await queryRunner.manager.save(tripUser);

      const passengerCoordinate = new TripCoordinate();
      passengerCoordinate.latitude = latitude;
      passengerCoordinate.longitude = longitude;
      passengerCoordinate.isStart = false;
      passengerCoordinate.isEnd = false;
      passengerCoordinate.tripUser = tripUser;

      await queryRunner.manager.save(passengerCoordinate);

      await queryRunner.commitTransaction();
      return tripUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error);
    } finally {
      await queryRunner.release();
    }
  }

  async findTripsByUser(
    userId: string,
    role: UserRole,
  ): Promise<ListTripResponseDto[]> {
    const trips = await this.tripUserRepository
      .createQueryBuilder('tripUser')
      .leftJoinAndSelect('tripUser.trip', 'trip')
      .leftJoinAndSelect('trip.tripUsers', 'tripUsers')
      .where('tripUser.user.id = :userId', { userId })
      .andWhere('tripUser.role = :role', { role })
      .select([
        'tripUser.joinDate',
        'tripUser.status',
        'trip.id',
        'trip.origin',
        'trip.destination',
        'trip.startDate',
        'trip.description',
        'trip.estimatedCost',
        'tripUsers.id',
        'trip.maxPassengers',
      ])
      .getMany();
    const ret = trips.map((tu) => {
      const tripDto = new ListTripResponseDto();
      tripDto.id = tu.trip.id;
      tripDto.origin = tu.trip.origin;
      tripDto.destination = tu.trip.destination;
      tripDto.startDate = tu.trip.startDate;
      tripDto.description = tu.trip.description;
      tripDto.estimatedCost = tu.trip.estimatedCost;
      tripDto.maxPassengers = tu.trip.maxPassengers;
      tripDto.registrants = tu.trip.tripUsers.length
        ? tu.trip.tripUsers.length - 1
        : 0;
      return tripDto;
    });

    return ret;
  }

  async getRequestDetails(tripUserId: string, tripId: string) {
    // Obtener el tripUser principal con estado pendiente
    const tripUser = await this.tripUserRepository
      .createQueryBuilder('tripUser')
      .innerJoinAndSelect('tripUser.user', 'user')
      .leftJoinAndSelect('tripUser.tripCoordinates', 'tripCoordinate')
      .where('tripUser.id = :tripUserId', { tripUserId })
      .andWhere('tripUser.status = :pendingStatus', {
        pendingStatus: TripUserStatus.Pending,
      })
      .getOne();

    if (!tripUser) {
      throw new BadRequestException(
        'Pending passenger not found or not in pending status.',
      );
    }

    // Resolver las tripCoordinates del tripUser principal
    const coordinates = await tripUser.tripCoordinates;

    // Obtener los tripUsers confirmados asociados al tripId
    const confirmedTripUsers = await this.tripUserRepository
      .createQueryBuilder('tripUser')
      .innerJoinAndSelect('tripUser.user', 'user')
      .leftJoinAndSelect('tripUser.tripCoordinates', 'tripCoordinate')
      .where('tripUser.trip.id = :tripId', { tripId })
      .andWhere('tripUser.status = :confirmedStatus', {
        confirmedStatus: TripUserStatus.Confirmed,
      })
      .getMany();

    // Obtener las coordenadas de los tripUsers confirmados utilizando la lógica de mapeo
    const coordinatesConfirmed = await Promise.all(
      confirmedTripUsers.map(async (confirmedTripUser) => {
        const confirmedCoordinates = await confirmedTripUser.tripCoordinates;
        return confirmedCoordinates.map((coordinate) => ({
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
          isStart: coordinate.isStart,
          isEnd: coordinate.isEnd,
        }));
      }),
    );

    return {
      tripUserId: tripUser.id,
      name: tripUser.user.name,
      surname: tripUser.user.surname,
      email: tripUser.user.email,
      isUserVerified: tripUser.user.isUserVerified,
      coordinates: coordinates.map((coordinate) => ({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        isStart: coordinate.isStart,
        isEnd: coordinate.isEnd,
      })),
      coordinatesConfirmed: coordinatesConfirmed.flat(),
      destination: 'DESTINATION',
      startDate: 'STARTDATE',
      origin: 'ORIGIN',
      contact: 2214444444,
    };
  }
}
