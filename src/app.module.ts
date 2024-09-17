import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripModule } from './trip/trip.module';
import { TripUserModule } from './trip-user/trip-user.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [UserModule, TypeOrmModule.forRoot({
    type: "mysql",
    host: "localhost",
    port: 3307,
    username: "tripbook",
    password: "root",
    database: "db_tripbook",
    autoLoadEntities: true,
    synchronize: true,
    logger: 'debug'
  }), TripModule, TripUserModule, AuthModule,],
  controllers: [],
  providers: [],
})
export class AppModule { }
