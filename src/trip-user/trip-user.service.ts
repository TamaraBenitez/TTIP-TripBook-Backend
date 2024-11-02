import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTripUserDto } from './dto/create-trip-user.dto';
import { TripUser, TripUserStatus, UserRole } from './entities/trip-user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
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
    private readonly tripCoordinateService: TripCoordinateService
  ) { }

  async registrationTripUser(createTripUserDto: CreateTripUserDto, tripDetails?: Trip, manager?: EntityManager) {
    const queryRunner = manager ? null : this.dataSource.createQueryRunner();

    if (queryRunner) {
      await queryRunner.startTransaction();
    }
    const { userId, tripId, role } = createTripUserDto;
    const existingEnrollment = await this.tripUserRepository.findOne({
      where: { user: { id: userId }, trip: { id: tripId } },
    });
    let trip = tripDetails;

    if (existingEnrollment) {
      throw new BadRequestException(
        'El usuario ya esta inscripto en este viaje',
      );
    }
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new NotFoundException('El usuario no existe en la plataforma');
    }

    if (!trip) { //User registering to an existing trip
      trip = await this.tripService.findTripEntityById(tripId);
    }

    try {
      const tripUser = this.tripUserRepository.create({
        user: user,
        trip: trip,
        joinDate: new Date(),
        status: TripUserStatus.Confirmed,
        role: role ?? UserRole.PASSENGER,
      });

      // Use the provided manager or the queryRunner's manager to save
      if (manager) {
        await manager.save(tripUser);
      } else {
        await queryRunner.manager.save(tripUser);
      }

      if (tripUser.role === UserRole.PASSENGER) {
        // Get the driver's start coordinate
        const driverCoordinate = await this.tripCoordinateService.getStartCoordinateByTripId(trip.id);

        if (driverCoordinate) {
          const passengerCoordinate = new TripCoordinate();
          passengerCoordinate.latitude = driverCoordinate.latitude;  // Use driver's start latitude
          passengerCoordinate.longitude = driverCoordinate.longitude;  // Use driver's start longitude
          passengerCoordinate.isStart = false; // Passenger's point, not start
          passengerCoordinate.isEnd = false;
          passengerCoordinate.tripUser = tripUser;

          // Save the passenger coordinate
          if (manager) {
            await manager.save(passengerCoordinate);
          } else {
            await queryRunner.manager.save(passengerCoordinate);
          }
        }
      }

      if (!manager) {
        await queryRunner.commitTransaction(); // Commit only if using queryRunner
      }

      return tripUser;

    } catch (error) {
      if (queryRunner) {
        await queryRunner.rollbackTransaction(); // Rollback only if using queryRunner
      }
      throw new InternalServerErrorException(error);
    } finally {
      if (queryRunner) {
        await queryRunner.release(); // Release only if using queryRunner
      }
    }
  }

  async registerPassengerWithOtherCoordinates(createPassengerDto: CreateTripWithOtherCoordinates) {

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    const { userId, tripId, latitude, longitude } = createPassengerDto;
    try {

      const existingEnrollment = await this.tripUserRepository.findOne({
        where: { user: { id: userId }, trip: { id: tripId } },
      });
      if (existingEnrollment) {
        throw new BadRequestException('El usuario ya está inscripto en este viaje');
      }


      const user = await this.userService.findOneById(userId);
      if (!user) {
        throw new NotFoundException('El usuario no existe en la plataforma');
      }


      const trip = await this.tripService.findTripEntityById(tripId);
      if (!trip) {
        throw new NotFoundException('El viaje no existe en la plataforma');
      }

      const conflictingEnrollment = await this.tripUserRepository.findOne({
        where: {
          user: { id: userId },
          trip: { startDate: trip.startDate },
        },
      });
      if (conflictingEnrollment) {
        throw new BadRequestException(
          'El usuario ya está inscripto en otro viaje en la misma fecha'
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


  async findTripsByUser(userId: string): Promise<ListTripResponseDto[]> {
    const trips = await this.tripUserRepository
      .createQueryBuilder('tripUser')
      .leftJoinAndSelect('tripUser.trip', 'trip')
      .leftJoinAndSelect('trip.tripUsers', 'tripUsers')
      .where('tripUser.user.id = :userId', { userId })
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
      tripDto.registrants = tu.trip.tripUsers
        ? tu.trip.tripUsers.reduce((count) => count + 1, 0)
        : 0;
      return tripDto;
    });

    return ret;
  }



}
