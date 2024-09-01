import { Injectable } from '@nestjs/common';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trip } from './entities/trip.entity';

@Injectable()
export class TripService {

  constructor(@InjectRepository(Trip) private readonly tripRepository: Repository<Trip>) { }

  create(createTripDto: CreateTripDto) {
    return 'This action adds a new trip';
  }

  async findAll() {
    return await this.tripRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} trip`;
  }

  update(id: number, updateTripDto: UpdateTripDto) {
    return `This action updates a #${id} trip`;
  }

  remove(id: number) {
    return `This action removes a #${id} trip`;
  }
}
