import { Controller, Get, Post, Body, Param, Query, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { TripService } from './trip.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { ApiBearerAuth, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { TripDetailsResponseDto } from './dto/details-trip.dto';
import { TripFiltersDto } from './dto/filters-trip-dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { plainToInstance } from 'class-transformer';
import { AuthGuard } from '../auth/guard/auth.guard';

@ApiTags('Trip')
@ApiBearerAuth()
@Controller('trip')
@UseGuards(AuthGuard)
export class TripController {
  constructor(private readonly tripService: TripService) { }

  @Get('imagesUrls')
  findImagesUrls() {
    return this.tripService.findImageUrls()
  }



  @Get()
  @ApiQuery({ name: 'origin', type: String, required: false, description: 'Origen del viaje' })
  @ApiQuery({ name: 'destination', type: String, required: false, description: 'Destino del viaje' })
  @ApiQuery({ name: 'startDate', type: String, required: false, description: 'Fecha de comienzo del viaje' })
  findAll(@Query() filters: TripFiltersDto) {
    return this.tripService.findAll(filters);
  }

  @Get(':id')
  @ApiQuery({ name: 'isTripUser', type: String, required: false })
  @ApiQuery({ name: 'tripUserId', type: String, required: false })
  findOneById(@Param('id') id: string,
    @Query('isTripUser') isTripUser?: string,
    @Query('tripUserId') tripUserId?: string,): Promise<TripDetailsResponseDto> {
    const isTripUserFlag = isTripUser === 'true';
    return this.tripService.findOneById(id, isTripUserFlag, tripUserId);
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  async create(@Body() body: any, @UploadedFile() file?: Express.Multer.File): Promise<any> {

    if (body.coordinates) {
      body.coordinates = JSON.parse(body.coordinates);
    }

    if (file) {
      body.image = file;
    }

    const createTripDto = plainToInstance(CreateTripDto, body);

    return this.tripService.createTrip(createTripDto);
  }




  @Get('/driver/:userId/pendingPassengers')
  async getDriverTripsWithPendingPassengers(@Param('userId') userId: string) {
    const tripsWithPendingPassengers = await this.tripService.getTripsWithPendingPassengers(userId);
    return tripsWithPendingPassengers;
  }


}
