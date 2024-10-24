import { TripUser } from "../../trip-user/entities/trip-user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('trip_coordinates')
export class TripCoordinate {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('decimal', { precision: 10, scale: 7 })
    latitude: number;  

    @Column('decimal', { precision: 10, scale: 7 })
    longitude: number;  

    @Column('bool', {default : false})
    isStart: boolean;
    
    @Column('bool', {default : false})
    isEnd: boolean;

    @ManyToOne(() => TripUser, (tripUser) => tripUser.tripCoordinates, { lazy: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'trip_user_id' })
    tripUser: TripUser;
}