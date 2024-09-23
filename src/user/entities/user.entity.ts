import { TripUser } from "src/trip-user/entities/trip-user.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";


export enum Gender {
    MALE = 'M',
    FEMALE = 'F',
}
@Entity('user')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    surname: string

    @Column({ unique: true })
    email: string;

    @Column()
    password: string

    @Column()
    nroDni: string

    @Column()
    nroTramiteDni: string


    @Column({ type: 'enum', enum: Gender }) // Usar el tipo enum
    gender: Gender; // Campo para el sexo

    @Column({ type: 'date' })
    @Column()
    birthDate: Date

    @Column({ nullable: true })
    province: string

    @Column({ nullable: true })
    locality: string

    @Column({ type: 'float', nullable: true })
    latitud: number;

    @Column({ type: 'float', nullable: true })
    longitud: number;

    @Column({ default: false })
    isValidated: boolean;

    @OneToMany(() => TripUser, (tripUser) => tripUser.user)
    tripUsers: TripUser[]; // Relación uno a muchos con TripUser

}