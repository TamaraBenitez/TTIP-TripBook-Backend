import { Controller, Get, Post, Body, Param, Query, } from '@nestjs/common';
import { TripUserService } from './trip-user.service';
import { CreateTripUserDto } from './dto/create-trip-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { CreateTripWithOtherCoordinates } from './dto/create-trip-user-with-other-coordinates.dto';
import { RejectRequestDto } from './dto/reject-request.dto';
import { FilterTripsDto } from './dto/filters-trip-user.dto';


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
    @Query() query: FilterTripsDto) {
    const { role, ...filters } = query;
    return this.tripUserService.findTripsByUser(userId, role, filters);
  }

  @Post('/createRegistrationWithOtherCoordinates')
  async registrationTripUserWithOtherCoordinates(@Body() createTripWithOtherCoordinates: CreateTripWithOtherCoordinates) {
    return this.tripUserService.registerPassengerWithOtherCoordinates(createTripWithOtherCoordinates)
  }

  @Get('/requestDetails/:tripUserId/:tripId')
  async getPassengerDetails(@Param('tripUserId') tripUserId: string, @Param('tripId') tripId: string) {
    return await this.tripUserService.getRequestDetails(tripUserId, tripId);
  }

  @Post('/acceptRequest/:tripUserId')
  async acceptRequest(@Param('tripUserId') tripUserId: string) {
    return await this.tripUserService.acceptRequest(tripUserId)
  }

  @Post('/rejectRequest/:tripUserId')
  async rejectRequest(@Param('tripUserId') tripUserId: string,
    @Body() rejectRequestDto: RejectRequestDto) {
    const { rejectionReason } = rejectRequestDto;
    return await this.tripUserService.rejectRequest(tripUserId, rejectionReason)
  }


}
