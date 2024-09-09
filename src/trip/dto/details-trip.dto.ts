import { TripUserResponseDto } from "src/trip-user/dto/details-trip-user.dto";

export class TripDetailsResponseDto {
    id: string;
    startPoint: string;
    endPoint: string;
    startDate: Date;
    description: string;
    estimatedCost: number;
    numberOfRegistrants: number;
    // latitud: number;
    // longitud: number;
  
    participants: TripUserResponseDto[];
  }