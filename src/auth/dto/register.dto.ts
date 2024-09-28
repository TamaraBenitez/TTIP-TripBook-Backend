import { Transform } from 'class-transformer';
import { IsDateString, IsEmail, IsNotEmpty, IsOptional, IsString, Length, MinLength } from 'class-validator';

export class RegisterDto {

    @IsString()
    name: string;

    @IsString()
    surname: string;

    @IsEmail()
    email: string;

    @IsDateString()
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