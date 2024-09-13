import { IsUUID, IsEnum } from 'class-validator';
import { TripUserStatus } from '../entities/trip-user.entity';
export class CreateTripUserDto {

    @IsUUID()
    userId: string;  // UUID of the user
  
    @IsUUID()
    tripId: string;  // UUID of the trip
  
    @IsEnum(TripUserStatus)
    status: TripUserStatus;  // Status from the TripUserStatus enum
}
