import { forwardRef, Module } from '@nestjs/common';
import { TripService } from './trip.service';
import { TripController } from './trip.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trip } from './entities/trip.entity';
import { UserService } from 'src/user/user.service';
import { TripCoordinateService } from 'src/trip-coordinate/trip-coordinate.service';
import { User } from 'src/user/entities/user.entity';
import { TripCoordinate } from 'src/trip-coordinate/entities/trip-coordinate.entity';
import { TripUser } from 'src/trip-user/entities/trip-user.entity';
import { TripUserService } from 'src/trip-user/trip-user.service';
import { TripUserModule } from 'src/trip-user/trip-user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Trip, User, TripUser, TripCoordinate]), forwardRef(() => TripUserModule), forwardRef(() => TripCoordinate)],
  controllers: [TripController],
  providers: [TripService, TripUserService, UserService, TripCoordinateService],
  exports: [TripService]
})
export class TripModule { }
