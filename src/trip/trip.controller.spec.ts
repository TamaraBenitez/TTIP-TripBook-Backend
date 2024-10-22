import { Test, TestingModule } from '@nestjs/testing';
import { TripController } from './trip.controller';
import { TripService } from './trip.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trip } from '../../src/trip/entities/trip.entity';
import { TripUser } from '../../src/trip-user/entities/trip-user.entity';
import { TripCoordinate } from 'src/trip-coordinate/entities/trip-coordinate.entity';
import { forwardRef } from '@nestjs/common';
import { TripUserModule } from 'src/trip-user/trip-user.module';
import { TripUserService } from 'src/trip-user/trip-user.service';
import { UserService } from 'src/user/user.service';
import { TripCoordinateService } from 'src/trip-coordinate/trip-coordinate.service';

describe('TripController', () => {
  let controller: TripController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forFeature([Trip, TripUser])],
      controllers: [TripController],
      providers: [TripService,],
      exports: [TripService]
    }).compile();

    controller = module.get<TripController>(TripController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
