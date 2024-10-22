import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListTripResponseDto } from 'src/trip/dto/list-trip.dto';


@Injectable()
export class UserService {

  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) { }
  async createUser(createUserDto: CreateUserDto) {
    return await this.userRepository.save(createUserDto)
  }

  async findOneByEmail(email: string): Promise<User> {
    return await this.userRepository.findOneBy({ email })
  }


  async findOneById(id: string): Promise<User> {

    return await this.userRepository.findOneBy({ id })
  }

  async findByVerifyToken(token: string): Promise<User> {
    return await this.userRepository.findOne({
      where: { emailVerificationToken: token }
    });
  }
  async getUserTrips(id: string): Promise<Array<ListTripResponseDto>> {
    const user = await this.userRepository.findOne({
      where: { id: id },
      relations: ['tripUsers', 'tripUsers.trip'],
    });

    //map trips to ListTripResponseDtos
    const trips = user.tripUsers.map(tu => {
      const tripDto = new ListTripResponseDto();
      tripDto.id = tu.trip.id;
      tripDto.startPoint = tu.trip.startPoint;
      tripDto.endPoint = tu.trip.endPoint;
      tripDto.startDate = tu.trip.startDate;
      tripDto.description = tu.trip.description;
      tripDto.estimatedCost = tu.trip.estimatedCost;
      tripDto.numberOfRegistrants = tu.trip.numberOfRegistrants;
      return tripDto
    }); // Extract trips
    return trips;
  }

  async update(id: string, updatedUser): Promise<User> {
    await this.userRepository.update(id, updatedUser);
    return this.findOneById(id);
  }


}
