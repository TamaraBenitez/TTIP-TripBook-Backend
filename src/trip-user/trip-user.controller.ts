import { Controller, Get, Post, Body, Param, Query, } from '@nestjs/common';
import { TripUserService } from './trip-user.service';
import { CreateTripUserDto } from './dto/create-trip-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { CreateTripWithOtherCoordinates } from './dto/create-trip-user-with-other-coordinates.dto';
import { UserRole } from './entities/trip-user.entity';


@ApiTags('TripUser')
@Controller('tripUser')
export class TripUserController {
  constructor(private readonly tripUserService: TripUserService) { }

  @Post()
  async registrationTripUser(@Body() createTripUserDto: CreateTripUserDto) {
    return this.tripUserService.registrationTripUser(createTripUserDto);
  }

  @Get(':userId/trips')
  async getTripsByUser(@Param('userId') userId: string,
    @Query('role') role: UserRole) {
    return this.tripUserService.findTripsByUser(userId, role);
  }

  @Post('/createRegistrationWithOtherCoordinates')
  async registrationTripUserWithOtherCoordinates(@Body() createTripWithOtherCoordinates: CreateTripWithOtherCoordinates) {
    return this.tripUserService.registerPassengerWithOtherCoordinates(createTripWithOtherCoordinates)
  }

  @Get('/requestDetails/:tripUserId')
  async getPassengerDetails(@Param('tripUserId') tripUserId: string) {
    return await this.tripUserService.getRequestDetails(tripUserId);
  }


}
