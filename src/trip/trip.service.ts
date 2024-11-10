import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CreateTripDto } from './dto/create-trip.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Trip } from './entities/trip.entity';
import { TripDetailsResponseDto } from './dto/details-trip.dto';
import {
  TripUserStatus,
  UserRole,
} from '../trip-user/entities/trip-user.entity';
import { TripUserService } from '../trip-user/trip-user.service';
import { CreateTripUserDto } from '../trip-user/dto/create-trip-user.dto';
import { TripCoordinate } from '../trip-coordinate/entities/trip-coordinate.entity';
import { TripCoordinateService } from '../trip-coordinate/trip-coordinate.service';
import { UserService } from '../user/user.service';
import { NotFoundException } from '@zxing/library';
import { ListTripResponseDto } from './dto/list-trip.dto';
import { format } from 'date-fns';


@Injectable()
export class TripService {
  constructor(
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
    @Inject(forwardRef(() => TripUserService))
    private readonly tripUserService: TripUserService,
    private readonly userService: UserService,
    private readonly tripCoordinateService: TripCoordinateService,
    private readonly dataSource: DataSource,
  ) { }

  async findAll() {
    const trips: Trip[] = await this.tripRepository.find({ relations: ['tripUsers'] });

    return trips.map((trip) => this.mapToListTripResponseDto(trip));
  }
  private mapToListTripResponseDto(trip: Trip): ListTripResponseDto {
    const registrantsCount = trip.tripUsers.length ? trip.tripUsers.length - 1 : trip.tripUsers.length; //registrants except the driver

    return {
      id: trip.id,
      origin: trip.origin,
      destination: trip.destination,
      startDate: trip.startDate,
      description: trip.description,
      estimatedCost: trip.estimatedCost,
      registrants: registrantsCount,
      maxPassengers: trip.maxPassengers,
    };
  }

  async findOneById(id: string) {
    //Find one trip and return only confirmed tripCoordinates
    const trip = await this.tripRepository.findOne({
      where: { id: id },
      relations: ['tripUsers', 'tripUsers.user'],
    });

    if (!trip) {
      throw new BadRequestException('El viaje no existe en la plataforma');
    }
    const confirmedTripUsers = trip.tripUsers.filter(
      (tripUser) => tripUser.status === TripUserStatus.Confirmed
    );

    // Mapear solo los participantes confirmados a DTO
    const participants = confirmedTripUsers.map((tripUser) => ({
      id: tripUser.user.id,
      name: tripUser.user.name,
      surname: tripUser.user.surname,
      email: tripUser.user.email,
      locality: tripUser.user.locality,
      province: tripUser.user.province,
    }));

    // Obtenemos las coordenadas de los trip_users confirmados
    const tripCoordinates = await this.tripCoordinateService.getCoordinatesByTripUsers(confirmedTripUsers);

    // Mapeamos los datos finales a TripDetailsResponseDto
    const tripDetails = new TripDetailsResponseDto();
    tripDetails.id = trip.id;
    tripDetails.origin = trip.origin;
    tripDetails.destination = trip.destination;
    tripDetails.startDate = trip.startDate;
    tripDetails.description = trip.description;
    tripDetails.estimatedCost = trip.estimatedCost;
    tripDetails.maxPassengers = trip.maxPassengers;
    tripDetails.participants = participants;
    tripDetails.tripCoordinates = tripCoordinates.flat();

    return tripDetails;
  }

  async findTripEntityById(tripId: string): Promise<Trip> {
    const trip = await this.tripRepository.findOne({
      where: { id: tripId },
      relations: ['tripUsers'],
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    return trip; // Return the full Trip entity
  }
  async createTrip(
    createTripDto: CreateTripDto,
  ): Promise<TripDetailsResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
  
    try {
      const {
        coordinates,
        startDate,
        description,
        estimatedCost,
        origin,
        destination,
        userId,
        maxPassengers,
        maxTolerableDistance
      } = createTripDto;
  
      const startDateOnly = format(new Date(startDate), 'yyyy-MM-dd');

      const existingTrip = await this.tripRepository
        .createQueryBuilder("trip")
        .leftJoin("trip.tripUsers", "tripUser")
        .leftJoin("tripUser.user", "user")
        .where("DATE(trip.startDate) = :startDateOnly", { startDateOnly })
        .andWhere("user.id = :userId", { userId })
        .getOne();



      if (existingTrip) {
        throw new BadRequestException('Ya tienes un viaje creado en la misma fecha');
      }
  
      // Create the trip entity
      const trip = new Trip();
      trip.origin = origin;
      trip.destination = destination;
      trip.startDate = startDate;
      trip.description = description;
      trip.estimatedCost = estimatedCost;
      trip.maxPassengers = maxPassengers;
      trip.maxTolerableDistance = maxTolerableDistance;
  
      // Save the trip
      const savedTrip = await queryRunner.manager.save(trip);
  
      // Create TripUser
      const tripUser = new CreateTripUserDto();
      tripUser.userId = userId;
      tripUser.tripId = savedTrip.id;
      tripUser.joinDate = new Date();
      tripUser.status = TripUserStatus.Confirmed;
      tripUser.role = UserRole.DRIVER;
  
      const savedTripUser = await this.tripUserService.registrationTripUser(
        tripUser,
        trip,
        queryRunner,
      );
  
      // Create and save coordinates
      for (let i = 0; i < coordinates.length; i++) {
        const coord = coordinates[i];
        const tripCoordinate = new TripCoordinate();
        tripCoordinate.latitude = coord.latitude;
        tripCoordinate.longitude = coord.longitude;
        tripCoordinate.isStart = i === 0; // Set true for the first coordinate
        tripCoordinate.isEnd = i === coordinates.length - 1; // Set true for the last coordinate
        tripCoordinate.tripUser = savedTripUser;
  
        await queryRunner.manager.save(tripCoordinate);
      }
  
      await queryRunner.commitTransaction();
  
      // Return the trip details as a DTO
      const tripDetails = new TripDetailsResponseDto();
      tripDetails.id = savedTrip.id;
      tripDetails.origin = savedTrip.origin;
      tripDetails.destination = savedTrip.destination;
      tripDetails.startDate = savedTrip.startDate;
      tripDetails.description = savedTrip.description;
      tripDetails.estimatedCost = savedTrip.estimatedCost;
      tripDetails.maxPassengers = savedTrip.maxPassengers;
      tripDetails.maxTolerableDistance = savedTrip.maxTolerableDistance;

      const user = await this.userService.findOneById(userId);
      // Include the driver in the participants
      tripDetails.participants = [
        {
          id: user.id,
          name: user.name,
          surname: user.surname,
          email: user.email,
          locality: user.locality,
          province: user.province,
        },
      ];

      return tripDetails;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getTripsWithPendingPassengers(userId: string) {
    const trips = await this.tripRepository
      .createQueryBuilder('trip')
      .innerJoin('trip.tripUsers', 'driver', 'driver.user_id = :userId AND driver.role = :driverRole', {
        userId,
        driverRole: UserRole.DRIVER,
      })
      .leftJoinAndSelect('trip.tripUsers', 'tripUser')
      .leftJoinAndSelect('tripUser.user', 'user')
      .where('tripUser.status = :pendingStatus AND tripUser.role = :passengerRole', {
        pendingStatus: TripUserStatus.Pending,
        passengerRole: UserRole.PASSENGER,
      })
      .getMany();

    const tripsWithPendingPassengers = trips.map(trip => {
      const pendingPassengers = trip.tripUsers
        .filter(tu => tu.status === TripUserStatus.Pending && tu.role === UserRole.PASSENGER)
        .map(tu => ({
          tripUserId: tu.id,
          name: tu.user.name,
          surname: tu.user.surname,
          email: tu.user.email,
        }));

      return {
        tripId: trip.id,
        origin: trip.origin,
        destination: trip.destination,
        pendingPassengers,
      };
    });

    return tripsWithPendingPassengers;
  }

}
