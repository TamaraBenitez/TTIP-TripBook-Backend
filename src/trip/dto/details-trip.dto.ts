import { UserDetailsResponseDto } from "src/user/dto/details-user.dto";

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
  
    participants: UserDetailsResponseDto[];
  }