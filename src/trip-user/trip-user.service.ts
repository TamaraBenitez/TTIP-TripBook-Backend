import { Injectable } from '@nestjs/common';
import { CreateTripUserDto } from './dto/create-trip-user.dto';
import { UpdateTripUserDto } from './dto/update-trip-user.dto';

@Injectable()
export class TripUserService {
  create(createTripUserDto: CreateTripUserDto) {
    return 'This action adds a new tripUser';
  }

  findAll() {
    return `This action returns all tripUser`;
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
