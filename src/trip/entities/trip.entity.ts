import { TripUser } from 'src/trip-user/entities/trip-user.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('trip')
export class Trip {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    destination: string;

    @Column()
    startDate: Date;

    @Column()
    endDate: Date;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column()
    estimatedCost: number;

    @Column({ type: 'int', default: 0 })
    numberOfRegistrants: number; // Número de personas inscriptas

    @OneToMany(() => TripUser, (tripUser) => tripUser.trip)
    tripUsers: TripUser[]; // Relación uno a muchos con TripUser
}