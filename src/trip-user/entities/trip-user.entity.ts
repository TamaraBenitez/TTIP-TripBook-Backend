import { TripCoordinate } from '../../trip-coordinate/entities/trip-coordinate.entity';
import { Trip } from '../../trip/entities/trip.entity';
import { User } from '../../user/entities/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

export enum TripUserStatus {
    Pending = 'pending',
    Confirmed = 'confirmed',
    Cancelled = 'cancelled',
    Rejected = 'rejected',
}

export enum UserRole {
    DRIVER = 'driver',
    PASSENGER = 'passenger'
}

@Entity('trip_users')
export class TripUser {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, (user) => user.tripUsers)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Trip, (trip) => trip.tripUsers)
    @JoinColumn({ name: 'trip_id' })
    trip: Trip;

    @Column()
    joinDate: Date; 

    @Column({ type: 'enum', enum: TripUserStatus })
    status: TripUserStatus;  

    @OneToMany(() => TripCoordinate, (tripCoordinate) => tripCoordinate.tripUser, { lazy: true })
    tripCoordinates: TripCoordinate[];

    @Column({ type: 'enum', enum: UserRole, default: UserRole.PASSENGER })
    role: UserRole;   
}

