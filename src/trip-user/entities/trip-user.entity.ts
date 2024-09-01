import { Trip } from 'src/trip/entities/trip.entity';
import { User } from 'src/user/entities/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

export enum TripUserStatus {
    Pending = 'pending',
    Confirmed = 'confirmed',
    Cancelled = 'cancelled',
    Rejected = 'rejected',
}

@Entity('trip_users')
export class TripUser {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.tripUsers)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Trip, (trip) => trip.tripUsers)
    @JoinColumn({ name: 'trip_id' })
    trip: Trip;

    @Column()
    joinDate: Date; // Fecha en la que el usuario se inscribió al viaje


    @Column({ type: 'enum', enum: TripUserStatus })
    status: TripUserStatus;   // Estado de la inscripción del usuario al viaje,usa el enum para el estado
}

