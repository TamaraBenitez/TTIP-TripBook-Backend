import { IsUUID, IsEnum, IsDateString } from 'class-validator';
import { TripUserStatus, UserRole } from '../entities/trip-user.entity';
export class CreateTripUserDto {

    @IsUUID()
    userId: string;  // UUID of the user
  
    @IsUUID()
    tripId: string;  // UUID of the trip
  
    @IsEnum(TripUserStatus)
    status: TripUserStatus;  // Status from the TripUserStatus enum

    @IsDateString()
    joinDate: Date;

    @IsEnum(UserRole)
    role: UserRole;
}
