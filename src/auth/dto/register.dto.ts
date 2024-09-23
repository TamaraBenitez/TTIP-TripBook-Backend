import { Transform } from 'class-transformer';
import { IsDate, IsDateString, IsEmail, IsOptional, IsPositive, IsString, MinLength } from 'class-validator';

export class RegisterDto {

    @IsString()
    name: string;

    @IsString()
    surname: string;

    @IsEmail()
    email: string;

    @IsDateString()
    @IsOptional()
    birthDate: Date

    @Transform(({ value }) => value.trim())
    @IsString()
    @MinLength(4)
    password: string;

    @IsString()
    @IsOptional()
    province?: string

    @IsString()
    @IsOptional()
    locality?: string

    @IsString()
    @IsOptional()
    latitud?: number;

    @IsString()
    @IsOptional()
    longitud?: number;
}