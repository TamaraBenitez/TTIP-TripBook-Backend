import { Vehicle } from '../../vehicle/entities/vehicle.entity'
import { TripUser } from '../../trip-user/entities/trip-user.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';

@Entity('trip')
export class Trip {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    origin: string;

    @Column()
    destination: string;

    @Column()
    startDate: Date;

    @Column({ type: 'text', nullable: true })
    imageUrl: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'int' })
    estimatedCost: number;

    @Column({ type: 'int' })
    maxPassengers: number;

    @Column({ type: 'int', default: 2500 })
    maxTolerableDistance: number;

    @OneToMany(() => TripUser, (tripUser) => tripUser.trip)
    tripUsers: TripUser[]; // Relación uno a muchos con TripUser

    @ManyToOne(() => Vehicle, (vehicle) => vehicle.trips)
    @JoinColumn({ name: 'vehicle_id' })
    vehicle: Vehicle;
}