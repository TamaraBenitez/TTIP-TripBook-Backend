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
  ) {}

  async findAll() {
    const trips: Trip[] = await this.tripRepository.find({ relations: ['tripUsers'] });

    return trips.map((trip) => this.mapToListTripResponseDto(trip));
  }
  private mapToListTripResponseDto(trip: Trip): ListTripResponseDto {
    const registrantsCount = trip.tripUsers.length;

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
    const trip = await this.tripRepository.findOne({
      where: { id: id },
      relations: ['tripUsers', 'tripUsers.user'],
    });

    if (!trip) {
      throw new BadRequestException('El viaje no existe en la plataforma');
    }
    // Map to DTO format
    const tripDetails = new TripDetailsResponseDto();
    tripDetails.id = trip.id;
    tripDetails.origin = trip.origin;
    tripDetails.destination = trip.destination;
    tripDetails.startDate = trip.startDate;
    tripDetails.description = trip.description;
    tripDetails.estimatedCost = trip.estimatedCost;
    tripDetails.maxPassengers = trip.maxPassengers;

    tripDetails.participants = trip.tripUsers.map((tripUser) => ({
      id: tripUser.user.id,
      name: tripUser.user.name,
      surname: tripUser.user.surname,
      email: tripUser.user.email,
      locality: tripUser.user.locality,
      province: tripUser.user.province,
    }));

    tripDetails.tripCoordinates = (await this.tripCoordinateService.getCoordinatesByTripUsers(trip.tripUsers)).flat();

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
        startPoint,
        endPoint,
        startDate,
        description,
        estimatedCost,
        origin,
        destination,
        userId,
        maxPassengers,
      } = createTripDto;

      // Create the trip entity
      const trip = new Trip();
      trip.origin = origin;
      trip.destination = destination;
      trip.startDate = startDate;
      trip.description = description;
      trip.estimatedCost = estimatedCost;
      trip.maxPassengers = maxPassengers;

      // Save the trip
      const savedTrip = await queryRunner.manager.save(trip);

      // Create TripUser
      const tripUser = new CreateTripUserDto();
      tripUser.userId = userId;
      tripUser.tripId = savedTrip.id;
      tripUser.joinDate = new Date(); // Current date when the trip is created
      tripUser.status = TripUserStatus.Confirmed;
      tripUser.role = UserRole.DRIVER; // Assign as the driver

      // Save the TripUser
      const savedTripUser = await this.tripUserService.registrationTripUser(
        tripUser,
        trip,
        queryRunner.manager,
      );
      // Create start coordinate
      const startCoordinate = new TripCoordinate();
      startCoordinate.latitude = startPoint.latitude;
      startCoordinate.longitude = startPoint.longitude;
      startCoordinate.isStart = true;
      startCoordinate.tripUser = savedTripUser;

      // Create end coordinate
      const endCoordinate = new TripCoordinate();
      endCoordinate.latitude = endPoint.latitude;
      endCoordinate.longitude = endPoint.longitude;
      endCoordinate.isEnd = true;
      endCoordinate.tripUser = savedTripUser;

      // Save the coordinates
      await queryRunner.manager.save(startCoordinate);
      await queryRunner.manager.save(endCoordinate);

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
}
