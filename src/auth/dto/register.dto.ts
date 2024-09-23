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

    @IsNotEmpty()
    @IsString()
    @Length(8, 8)
    nroDni: string;

    @IsNotEmpty()
    @IsString()
    @Length(11, 11)
    nroTramiteDni: string;

    @IsNotEmpty()
    @IsString()
    gender: 'M' | 'F';

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