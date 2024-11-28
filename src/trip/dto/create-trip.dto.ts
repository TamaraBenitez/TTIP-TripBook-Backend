import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsNumber, IsDate, IsNotEmpty, IsObject, IsDateString, IsArray, ValidateNested, IsOptional, IsUrl, IsInstance } from 'class-validator';
import { Express } from 'express';


export class CoordinateDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}
export class CreateTripDto {
  @IsString()
  @IsNotEmpty()
  origin: string;

  @IsString()
  @IsNotEmpty()
  destination: string;

  @ApiProperty({
    description: 'Lista de coordenadas del viaje',
    type: [CoordinateDto],
  })
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

  @IsOptional()
  imageUrl?: string;

  @IsOptional()
  @ApiProperty({ type: 'string', format: 'binary' })
  image?: any
}
