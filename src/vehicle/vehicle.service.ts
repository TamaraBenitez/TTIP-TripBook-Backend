import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class VehicleService {
    constructor(
        @InjectRepository(Vehicle)
        private readonly vehicleRepository: Repository<Vehicle>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }


    async createVehicle(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
        const { ownerId, ...vehicleData } = createVehicleDto;


        const owner = await this.userRepository.findOne({ where: { id: ownerId } });
        if (!owner) {
            throw new NotFoundException(`El usuario no existe.`);
        }


        const newVehicle = this.vehicleRepository.create({
            ...vehicleData,
            owner,
        });
        return this.vehicleRepository.save(newVehicle);
    }


    async getVehiclesByOwner(ownerId: string): Promise<Vehicle[]> {

        const owner = await this.userRepository.findOne({ where: { id: ownerId } });
        if (!owner) {
            throw new NotFoundException(`El usuario no existe.`);
        }


        return this.vehicleRepository.find({
            where: { owner: { id: ownerId } },
            relations: ['owner'],
        });
    }
}
