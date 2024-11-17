import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { TripService } from './trip.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { TripDetailsResponseDto } from './dto/details-trip.dto';
import { TripFiltersDto } from './dto/filters-trip-dto';

@ApiTags('Trip')
@Controller('trip')
export class TripController {
  constructor(private readonly tripService: TripService) { }



  @Get()
  @ApiQuery({ name: 'origin', type: String, required: false, description: 'Origen del viaje' })
  @ApiQuery({ name: 'destination', type: String, required: false, description: 'Destino del viaje' })
  @ApiQuery({ name: 'startDate', type: String, required: false, description: 'Fecha de comienzo del viaje' })
  findAll(@Query() filters: TripFiltersDto) {
    return this.tripService.findAll(filters);
  }

  @Get(':id')
  findOneById(@Param('id') id: string): Promise<TripDetailsResponseDto> {
    return this.tripService.findOneById(id);
  }

  @Post()
  create(@Body() createTripDto: CreateTripDto) {
    return this.tripService.createTrip(createTripDto)
  }

  @Get('/driver/:userId/pendingPassengers')
  async getDriverTripsWithPendingPassengers(@Param('userId') userId: string) {
    const tripsWithPendingPassengers = await this.tripService.getTripsWithPendingPassengers(userId);
    return tripsWithPendingPassengers;
  }

}
