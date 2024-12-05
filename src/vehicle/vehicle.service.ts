import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UserService } from '../user/user.service';
import { VehicleResponseDto } from './dto/vehicle-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class VehicleService {
    constructor(
        @InjectRepository(Vehicle)
        private readonly vehicleRepository: Repository<Vehicle>,
        private readonly userService: UserService,
    ) { }


    async createVehicle(createVehicleDto: CreateVehicleDto): Promise<VehicleResponseDto> {
        const { ownerId, ...vehicleData } = createVehicleDto;

        // Buscar el propietario
        const owner = await this.userService.findOneById(ownerId);
        if (!owner) {
            throw new NotFoundException('El usuario no existe.');
        }


        const newVehicle = this.vehicleRepository.create({
            ...vehicleData,
            owner,
        });

        const savedVehicle = await this.vehicleRepository.save(newVehicle);


        return plainToInstance(VehicleResponseDto, savedVehicle, {
            excludeExtraneousValues: true,
        });
    }


    async getVehiclesByOwner(ownerId: string): Promise<VehicleResponseDto[]> {
        const owner = await this.userService.findOneById(ownerId);
        if (!owner) {
            throw new NotFoundException('El usuario no existe');
        }

        const vehicles = await this.vehicleRepository.find({
            where: { owner: { id: ownerId } },
            relations: ['owner'],
        });

        return plainToInstance(VehicleResponseDto, vehicles, {
            excludeExtraneousValues: true,
        });
    }


    async findOneById(vehicleId: string): Promise<Vehicle> {
        const vehicle = await this.vehicleRepository.findOne({ where: { id: vehicleId } });
        if (!vehicle) {
            throw new NotFoundException(`El vehículo no existe.`);
        }
        return vehicle;
    }
}
