import { Module } from '@nestjs/common';
import { TripUserService } from './trip-user.service';
import { TripUserController } from './trip-user.controller';
import { TripUser } from './entities/trip-user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { TripModule } from 'src/trip/trip.module';

@Module({
  imports: [TypeOrmModule.forFeature([TripUser]), UserModule, TripModule],
  controllers: [TripUserController],
  providers: [TripUserService],
})
export class TripUserModule { }
