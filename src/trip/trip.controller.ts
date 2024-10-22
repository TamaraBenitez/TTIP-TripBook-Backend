import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TripService } from './trip.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { ApiTags } from '@nestjs/swagger';
import { TripDetailsResponseDto } from './dto/details-trip.dto';

@ApiTags('Trip')
@Controller('trip')
export class TripController {
  constructor(private readonly tripService: TripService) { }



  @Get()
  findAll() {
    return this.tripService.findAll();
  }

  @Get(':id')
  findOneById(@Param('id') id: string): Promise<TripDetailsResponseDto> {
    return this.tripService.findOneById(id);
  }

  @Post()
  create(@Body() createTripDto: CreateTripDto) {
    return this.tripService.createTrip(createTripDto)
  }

}
