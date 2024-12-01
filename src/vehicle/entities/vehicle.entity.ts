import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Trip } from '../../trip/entities/trip.entity';

@Entity('vehicle')
export class Vehicle {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    model: string; // Modelo del vehículo (ej. Toyota Corolla)

    @Column()
    color: string; // Color del vehículo

    @Column()
    plateNumber: string; // Matrícula del vehículo 

    @Column({ nullable: true })
    year: number; // Año de fabricación del vehículo (opcional)

    @ManyToOne(() => User, (user) => user.vehicles)
    @JoinColumn({ name: 'owner_id' })
    owner: User; // Propietario del vehículo (el conductor)

    @OneToMany(() => Trip, (trip) => trip.vehicle)
    trips: Trip[]; // Viajes asociados al vehículo
}
