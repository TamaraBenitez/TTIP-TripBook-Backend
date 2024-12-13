import { TripCoordinateDetailsDto } from "src/trip-coordinate/dto/trip-coordinate-details.dto";
import { UserDetailsResponseDto } from "src/user/dto/details-user.dto";
import { VehicleResponseDto } from "../../vehicle/dto/vehicle-response.dto";
import { TripUserStatus } from "../../trip-user/entities/trip-user.entity";

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
  tripCoordinates: TripCoordinateDetailsDto[];
  imageUrl?: string;
  vehicle: VehicleResponseDto;
  tripUserCoordinate?: any
  tripUserStatus?: TripUserStatus
}