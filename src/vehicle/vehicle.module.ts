import { Module } from '@nestjs/common';
import { Vehicle } from './entities/vehicle.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleService } from './vehicle.service';
import { UserModule } from '../user/user.module';

@Module({
    imports: [TypeOrmModule.forFeature([Vehicle]), UserModule],
    providers: [VehicleService],
})
export class VehicleModule { }
