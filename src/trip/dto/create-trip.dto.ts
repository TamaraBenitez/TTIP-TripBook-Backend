import { Type } from 'class-transformer';
import { IsString, IsNumber, IsDate, IsNotEmpty, IsObject, IsDateString, IsArray, ValidateNested } from 'class-validator';

export class CreateTripDto {
    @IsString()
    @IsNotEmpty()
    origin: string;
  
    @IsString()
    @IsNotEmpty()
    destination: string;
  
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CoordinateDto)
    @IsNotEmpty()
    coordinates: CoordinateDto[];
  
    @IsDateString()
    startDate: Date;
  
    @IsString()
    description: string;
  
    @IsNumber()
    estimatedCost: number;
  
    @IsNumber()
    maxPassengers: number;
  
    @IsNumber()
    maxTolerableDistance: number;
  
    @IsString()
    @IsNotEmpty()
    userId: string;
  }
  
  export class CoordinateDto {
    @IsNumber()
    latitude: number;
  
    @IsNumber()
    longitude: number;
  }