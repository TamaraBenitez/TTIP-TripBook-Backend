import { TripUser } from "src/trip-user/entities/trip-user.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";


@Entity('user')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    surname: string

    @Column({ unique: true })
    email: string;

    @Column()
    password: string

    @Column()
    age: number

    @Column()
    province: string

    @Column()
    locality: string

    @OneToMany(() => TripUser, (tripUser) => tripUser.user)
    tripUsers: TripUser[]; // Relación uno a muchos con TripUser
}