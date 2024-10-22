import { Injectable } from "@nestjs/common";
import { TripCoordinate } from "./entities/trip-coordinate.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { TripUser, UserRole } from "src/trip-user/entities/trip-user.entity";

@Injectable()
export class TripCoordinateService {

  constructor(
    @InjectRepository(TripCoordinate)
    private tripCoordinateRepository: Repository<TripCoordinate>,
  ) {}
    
  async createTripCoordinate(tripCoords: TripCoordinate) {
    return await this.tripCoordinateRepository.save(tripCoords)
  }    

  async getCoordinatesByTripUsers(tripUsers: TripUser[]): Promise<any[]> {
    return Promise.all(
      tripUsers.map(async (tripUser) => {
        const coordinates = await tripUser.tripCoordinates; 
        return Promise.all(
          coordinates.map(async (coordinate) => ({
            latitude: coordinate.latitude,
            longitude: coordinate.longitude,
            isStart: coordinate.isStart,
            isEnd: coordinate.isEnd,
            userId: (await coordinate.tripUser).id,
          })),
        );
      }),
    );
  }

  async getStartCoordinateByTripId(tripId: string): Promise<TripCoordinate | null> {
    return await this.tripCoordinateRepository.findOne({
      where: { tripUser: { trip: { id: tripId } }, isStart: true },
    });
  }
}