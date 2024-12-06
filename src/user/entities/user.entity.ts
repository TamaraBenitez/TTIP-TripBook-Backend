import { Vehicle } from "../../vehicle/entities/vehicle.entity";
import { TripUser } from "../../trip-user/entities/trip-user.entity";
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

    @Column({ nullable: true, default: null })
    nroDni: string

    @Column({ nullable: true, default: null })
    nroTramiteDni: string


    @Column({ type: 'enum', enum: Gender, nullable: true }) // Usar el tipo enum
    gender: Gender; // Campo para el sexo

    @Column({ type: 'date' })
    @Column()
    birthDate: Date

    @Column({ nullable: true })
    province: string

    @Column({ nullable: true })
    locality: string

    @Column({ default: false })
    isEmailVerified: boolean;

    @Column({ default: false })
    isUserVerified: boolean;

    @Column({ nullable: true })
    emailVerificationToken: string;

    @Column({ type: 'timestamp', nullable: true })
    emailVerificationTokenExpires: Date;

    // @Column({type: "array", nullable:true})
    // socialMediaLinks

    @OneToMany(() => TripUser, (tripUser) => tripUser.user)
    tripUsers: TripUser[]; // Relación uno a muchos con TripUser


    @Column({ type: 'longtext' })
    imageDescriptor: string; // Campo para almacenar el descriptor de la imagen en base64

    @Column({ type: "varchar", length: 15 })
    phoneNumber: string;

    @OneToMany(() => Vehicle, (vehicle) => vehicle.owner)
    vehicles: Vehicle[]; // Vehículos registrados por este usuario

}