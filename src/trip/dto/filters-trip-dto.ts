import { IsOptional, IsString, IsDateString } from 'class-validator';

export class TripFiltersDto {
    @IsOptional()
    @IsString()
    origin?: string;

    @IsOptional()
    @IsString()
    destination?: string;

    @IsOptional()
    @IsDateString()
    startDate?: string;
}
