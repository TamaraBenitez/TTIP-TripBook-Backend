import { forwardRef, Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripModule } from './trip/trip.module';
import { TripUserModule } from './trip-user/trip-user.module';
import { AuthModule } from './auth/auth.module';
import { Pdf417DecoderModule } from './pdf417-decoder/pdf417-decoder.module';
import { ConfigModule } from '@nestjs/config';
import configuration from 'config/configuration';
import { TripCoordinateModule } from './trip-coordinate/trip-coordinate.module';
import { CompareImageService } from './compare-image/compare-image.service';
import { CompareImageModule } from './compare-image/compare-image.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "mysql",
      host: "localhost",
      port: 3307,
      username: "tripbook",
      password: "root",
      database: "db_tripbook",
      autoLoadEntities: true,
      synchronize: true,
      logger: 'debug',
    }),
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true
    }),
    UserModule,
    forwardRef(() => TripModule),
    forwardRef(() => TripUserModule),
    TripCoordinateModule,
    AuthModule,
    Pdf417DecoderModule,
    CompareImageModule],
  controllers: [],
  providers: [CompareImageService],
})
export class AppModule { }
