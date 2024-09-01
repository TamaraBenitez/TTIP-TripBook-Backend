import { TripUser } from 'src/trip-user/entities/trip-user.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('trip')
export class Trip {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    startPoint: string; //  punto de partida

    @Column()
    endPoint: string; //punto de destino
    @Column()
    startDate: Date;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    estimatedCost: number;

    @Column({ type: 'int', default: 0 })
    numberOfRegistrants: number; // Número de personas inscriptas


    @Column({ type: 'float', nullable: true })
    latitud: number;

    @Column({ type: 'float', nullable: true })
    longitud: number;

    @OneToMany(() => TripUser, (tripUser) => tripUser.trip)
    tripUsers: TripUser[]; // Relación uno a muchos con TripUser
}