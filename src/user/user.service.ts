import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListTripResponseDto } from 'src/trip/dto/list-trip.dto';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) { }
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async findOneById(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id })
    if (!user) {
      throw new BadRequestException('El usuario no existe en la plataforma')
    }
    return user
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

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
