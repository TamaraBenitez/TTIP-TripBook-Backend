import { TripUser } from 'src/trip-user/entities/trip-user.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

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
    description: string;

    @Column({ type: 'int' })
    estimatedCost: number;

    @Column({ type: 'int'})
    maxPassengers: number;

    @OneToMany(() => TripUser, (tripUser) => tripUser.trip)
    tripUsers: TripUser[]; // Relación uno a muchos con TripUser
}