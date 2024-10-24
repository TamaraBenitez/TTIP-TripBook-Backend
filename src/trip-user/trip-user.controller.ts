import { Controller, Get, Post, Body, Param, } from '@nestjs/common';
import { TripUserService } from './trip-user.service';
import { CreateTripUserDto } from './dto/create-trip-user.dto';
import { ApiTags } from '@nestjs/swagger';


@ApiTags('TripUser')
@Controller('tripUser')
export class TripUserController {
  constructor(private readonly tripUserService: TripUserService) { }

  @Post()
  async registrationTripUser(@Body() createTripUserDto: CreateTripUserDto) {
    return this.tripUserService.registrationTripUser(createTripUserDto);
  }

  @Get(':userId/trips')
  async getTripsByUser(@Param('userId') userId: string) {
    return this.tripUserService.findTripsByUser(userId);
  }




}
