import { TripCoordinateDetailsDto } from "src/trip-coordinate/dto/trip-coordinate-details.dto";
import { UserDetailsResponseDto } from "src/user/dto/details-user.dto";

export class TripDetailsResponseDto {
    id: string;
    origin: string;
    destination: string;
    startDate: Date;
    description: string;
    estimatedCost: number;
    maxPassengers: number;
    maxTolerableDistance: number;
    participants: UserDetailsResponseDto[];
    tripCoordinates:TripCoordinateDetailsDto[];
  }