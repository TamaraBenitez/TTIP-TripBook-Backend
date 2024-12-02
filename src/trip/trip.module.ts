import { forwardRef, Module } from '@nestjs/common';
import { TripService } from './trip.service';
import { TripController } from './trip.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trip } from './entities/trip.entity';
import { UserService } from '../user/user.service';
import { TripCoordinateService } from '../trip-coordinate/trip-coordinate.service';
import { User } from '../user/entities/user.entity';
import { TripCoordinate } from '../trip-coordinate/entities/trip-coordinate.entity';
import { TripUser } from '../trip-user/entities/trip-user.entity';
import { TripUserService } from '../trip-user/trip-user.service';
import { TripUserModule } from '../trip-user/trip-user.module';
import { ImgurModule } from '../imgur/imgur.module';
import { VehicleModule } from '../vehicle/vehicle.module';

@Module({
  imports: [TypeOrmModule.forFeature([Trip, User, TripUser, TripCoordinate]), forwardRef(() => TripUserModule), forwardRef(() => TripCoordinate), ImgurModule, VehicleModule],
  controllers: [TripController],
  providers: [TripService, TripUserService, UserService, TripCoordinateService],
  exports: [TripService]
})
export class TripModule { }
