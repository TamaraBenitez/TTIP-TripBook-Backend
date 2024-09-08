import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TripUserService } from './trip-user.service';
import { CreateTripUserDto } from './dto/create-trip-user.dto';
import { UpdateTripUserDto } from './dto/update-trip-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { TripUser } from './entities/trip-user.entity';

@ApiTags('TripUser')
@Controller('tripUser')
export class TripUserController {
  constructor(private readonly tripUserService: TripUserService) { }

  @Post(':userId/:tripId')
  async registrationTripUser(
    @Param('userId') userId: string,
    @Param('tripId') tripId: string,
  ) {
    return this.tripUserService.registrationTripUser(userId, tripId);
  }

  @Get(':userId/trips')
  async getTripsByUser(@Param('userId') userId: string) {
    return this.tripUserService.findTripsByUser(userId);
  }


  @Get()
  findAll() {
    return this.tripUserService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tripUserService.findOne(+id);
  }


}
