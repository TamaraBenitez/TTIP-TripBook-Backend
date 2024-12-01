import { IsNotEmpty, IsOptional, IsString, IsUUID, IsNumber, Min } from 'class-validator';

export class CreateVehicleDto {
    @IsNotEmpty()
    @IsString()
    model: string;
    @IsNotEmpty()
    @IsString()
    color: string;

    @IsNotEmpty()
    @IsString()
    plateNumber: string;

    @IsOptional()
    @IsNumber()
    @Min(1886)
    year?: number;

    @IsNotEmpty()
    @IsUUID()
    ownerId: string;
}
