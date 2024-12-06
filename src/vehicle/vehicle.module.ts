import { forwardRef, Module } from '@nestjs/common';
import { Vehicle } from './entities/vehicle.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleService } from './vehicle.service';
import { UserModule } from '../user/user.module';
import { VehicleController } from './vehicle.controller';
import { TripUserModule } from '../trip-user/trip-user.module';



@Module({
    imports: [TypeOrmModule.forFeature([Vehicle]), UserModule, forwardRef(() => TripUserModule)],
    providers: [VehicleService],
    controllers: [VehicleController],
    exports: [VehicleService]
})
export class VehicleModule { }
