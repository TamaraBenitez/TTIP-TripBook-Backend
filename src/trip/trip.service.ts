import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trip } from './entities/trip.entity';
import { TripDetailsResponseDto } from './dto/details-trip.dto';

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
    const trip = await this.tripRepository.findOne({
      where: { id: id },
      relations: ['tripUsers', 'tripUsers.user'], 
    });
    
    if (!trip) {
      throw new BadRequestException('El viaje no existe en la plataforma')
    }
    // Map to DTO format
    const tripDetails = new TripDetailsResponseDto();
    tripDetails.id = trip.id;
    tripDetails.startPoint = trip.startPoint;
    tripDetails.endPoint = trip.endPoint;
    tripDetails.startDate = trip.startDate;
    tripDetails.description = trip.description;
    tripDetails.estimatedCost = trip.estimatedCost;
    tripDetails.numberOfRegistrants = trip.numberOfRegistrants;

    // Map participants
    tripDetails.participants = trip.tripUsers.map(tripUser => ({
      id: tripUser.id,
      user: {
        id: tripUser.user.id,
        name: tripUser.user.name,
        surname: tripUser.user.surname,
        email: tripUser.user.email,
        locality: tripUser.user.locality
      },
      joinDate: tripUser.joinDate,
      status: tripUser.status,
    }));
    return tripDetails
  }




}
