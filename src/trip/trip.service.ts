import { BadRequestException, Injectable } from '@nestjs/common';
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

  async incrementRegistrants(tripId: string): Promise<void> {
    await this.tripRepository.increment({ id: tripId }, 'numberOfRegistrants', 1);
  }

  async findAll() {
    return await this.tripRepository.find();
  }

  async findOneById(id: string) {
    const trip = await this.tripRepository.findOneBy({ id })
    if (!trip) {
      throw new BadRequestException('El viaje no existe en la plataforma')
    }
    return trip
  }

  update(id: number, updateTripDto: UpdateTripDto) {
    return `This action updates a #${id} trip`;
  }

  remove(id: number) {
    return `This action removes a #${id} trip`;
  }
}
