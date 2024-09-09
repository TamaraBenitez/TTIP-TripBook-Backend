import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateTripUserDto } from './dto/create-trip-user.dto';
import { UpdateTripUserDto } from './dto/update-trip-user.dto';
import { TripUser, TripUserStatus } from './entities/trip-user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { TripService } from 'src/trip/trip.service';

@Injectable()
export class TripUserService {

  constructor(
    @InjectRepository(TripUser)
    private readonly tripUserRepository: Repository<TripUser>,
    private readonly userService: UserService,
    private readonly tripService: TripService,
  ) { }

  async registrationTripUser(createTripUserDto: CreateTripUserDto) {
    const { userId, tripId } = createTripUserDto;
    const existingEnrollment = await this.tripUserRepository.findOne({
      where: { user: { id: userId }, trip: { id: tripId } },
    });

    if (existingEnrollment) {
      throw new BadRequestException('El usuario ya esta inscripto en este viaje')
    }
    let user;
    // try{
    //   user = await this.userService.findOneById(userId);
    // } catch (error) {
    //   debugger;
    //   console.log(error)
    // }
    // if (!user) {
    //   throw new NotFoundException('El usuario no existe en la plataforma');
    // }

    const trip = await this.tripService.findOneById(tripId);
    if (!trip) {
      throw new NotFoundException('El viaje no existe en la plataforma');
    }


    try {

      const tripUser = this.tripUserRepository.create({
        user: user,
        trip: trip,
        joinDate: new Date(),
        status: TripUserStatus.Confirmed,
      });

      await this.tripUserRepository.save(tripUser);

      await this.tripService.incrementRegistrants(tripId);
    }
    catch (error) {
      throw new InternalServerErrorException(error)
    }


    return { success: true };
  }

  async findAll() {
    return await this.tripUserRepository.find();
  }

  async findTripsByUser(userId: string) {
    const trips = await this.tripUserRepository
      .createQueryBuilder('tripUser')
      .leftJoinAndSelect('tripUser.trip', 'trip')
      .where('tripUser.user.id = :userId', { userId })
      .select([
        'tripUser.joinDate',
        'tripUser.status',
        'trip.startPoint',
        'trip.endPoint',
        'trip.startDate',
        'trip.description',
        'trip.estimatedCost',
        'trip.numberOfRegistrants'
      ])
      .getMany();

    return trips;
  }


  findOne(id: number) {
    return `This action returns a #${id} tripUser`;
  }


}
