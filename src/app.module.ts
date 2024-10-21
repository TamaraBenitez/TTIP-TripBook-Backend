import { forwardRef, Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripModule } from './trip/trip.module';
import { TripUserModule } from './trip-user/trip-user.module';
import { AuthModule } from './auth/auth.module';
import { Pdf417DecoderModule } from './pdf417-decoder/pdf417-decoder.module';
import { ConfigModule } from '@nestjs/config';
import configuration from 'config/configuration';
import { FileUploadModule } from './file-upload/file-upload.module';
import { TripCoordinateModule } from './trip-coordinate/trip-coordinate.module';

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
  FileUploadModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
