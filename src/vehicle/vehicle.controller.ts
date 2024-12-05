import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guard/auth.guard';
import { VehicleResponseDto } from './dto/vehicle-response.dto';

@ApiTags('Vehicles')
@Controller('vehicles')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class VehicleController {
    constructor(private readonly vehicleService: VehicleService) { }

    @Post()
    async createVehicle(@Body() createVehicleDto: CreateVehicleDto): Promise<VehicleResponseDto> {
        return this.vehicleService.createVehicle(createVehicleDto);
    }


    @Get('owner/:ownerId')
    async getVehiclesByOwner(@Param('ownerId') ownerId: string): Promise<VehicleResponseDto[]> {
        return this.vehicleService.getVehiclesByOwner(ownerId);
    }
}
