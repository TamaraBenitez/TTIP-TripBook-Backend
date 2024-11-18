import { IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';
import { UserRole } from '../entities/trip-user.entity';

export class FilterTripsDto {

    @IsEnum(UserRole)
    role?: UserRole;

    @IsOptional()
    @IsString()
    origin?: string;

    @IsOptional()
    @IsString()
    destination?: string;

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsString()
    status?: string;
}
