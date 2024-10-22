import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripCoordinate } from './entities/trip-coordinate.entity';
import { TripCoordinateService } from './trip-coordinate.service';

@Module({
  imports: [TypeOrmModule.forFeature([TripCoordinate])],
  controllers: [],
  providers: [TripCoordinateService],
  exports:[TripCoordinateService]
})
export class TripCoordinateModule { }
