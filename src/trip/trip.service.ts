import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trip } from './entities/trip.entity';

@Injectable()
export class TripService {

  constructor(@InjectRepository(Trip) private readonly tripRepository: Repository<Trip>) { }



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




}
