import { IsString, IsNumber, IsDate, IsNotEmpty, IsObject, IsDateString } from 'class-validator';

export class CreateTripDto {
    @IsString()
    @IsNotEmpty()
    origin: string;

    @IsString()
    @IsNotEmpty()
    destination: string;

    @IsObject()
    startPoint: {
        latitude: number;
        longitude: number;
    };

    @IsObject()
    endPoint: {
        latitude: number;
        longitude: number;
    };

    @IsDateString()
    startDate: Date;

    @IsString()
    description: string;

    @IsNumber()
    estimatedCost: number;

    @IsNumber()
    maxPassengers: number;

    @IsString()
    @IsNotEmpty()
    userId: string;
}