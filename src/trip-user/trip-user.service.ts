import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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

  async createTripUser(userId: string, tripId: string): Promise<TripUser> {
    const existingEnrollment = await this.tripUserRepository.findOne({
      where: { user: { id: userId }, trip: { id: tripId } },
    });

    if (existingEnrollment) {
      throw new BadRequestException('The user is already registered for this trip')
    }
    const userAndTrip = await this.tripUserRepository.createQueryBuilder('tripUser')
      .leftJoinAndSelect('tripUser.user', 'user', 'user.id = :userId', { userId })
      .leftJoinAndSelect('tripUser.trip', 'trip', 'trip.id = :tripId', { tripId })
      .getOne();

    if (!userAndTrip?.user) {
      throw new NotFoundException('User not found');
    }

    if (!userAndTrip?.trip) {
      throw new NotFoundException('Trip not found');
    }
    const tripUser = this.tripUserRepository.create({
      user: userAndTrip.user,
      trip: userAndTrip.trip,
      joinDate: new Date(),
      status: TripUserStatus.Confirmed,
    });

    return await this.tripUserRepository.save(tripUser);
  }

  async findAll() {
    return await this.tripUserRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} tripUser`;
  }

  update(id: number, updateTripUserDto: UpdateTripUserDto) {
    return `This action updates a #${id} tripUser`;
  }

  remove(id: number) {
    return `This action removes a #${id} tripUser`;
  }
}
