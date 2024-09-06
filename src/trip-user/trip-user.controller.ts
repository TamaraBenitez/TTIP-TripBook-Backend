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
  async createTripUser(
    @Param('userId') userId: string,
    @Param('tripId') tripId: string,
  ): Promise<TripUser> {
    return this.tripUserService.createTripUser(userId, tripId);
  }

  @Get()
  findAll() {
    return this.tripUserService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tripUserService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTripUserDto: UpdateTripUserDto) {
    return this.tripUserService.update(+id, updateTripUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tripUserService.remove(+id);
  }
}
