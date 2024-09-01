import { Module } from '@nestjs/common';
import { TripUserService } from './trip-user.service';
import { TripUserController } from './trip-user.controller';
import { TripUser } from './entities/trip-user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([TripUser])],
  controllers: [TripUserController],
  providers: [TripUserService],
})
export class TripUserModule { }
