import { TripUserStatus } from "../../trip-user/entities/trip-user.entity";

export class ListTripResponseDto {
  id: string;
  origin: string;
  destination: string;
  startDate: Date;
  description: string;
  estimatedCost: number;
  registrants: number;
  maxPassengers: number;
  status?: TripUserStatus;
  tripUserId?: string;
}