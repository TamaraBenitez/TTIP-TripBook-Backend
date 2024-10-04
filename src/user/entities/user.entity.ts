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

    @Column({ nullable: true, default:null })
    nroDni: string

    @Column({ nullable: true, default:null })
    nroTramiteDni: string


    @Column({ type: 'enum', enum: Gender, nullable:true }) // Usar el tipo enum
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

}