import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsEmail, IsNumber, IsOptional, IsString, Matches, MinLength } from 'class-validator';

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

    @Transform(({ value }) => (value === '' ? undefined : value))
    @IsString()
    @IsOptional()
    province?: string

    @Transform(({ value }) => (value === '' ? undefined : value))
    @IsString()
    @IsOptional()
    locality?: string

    @Transform(({ value }) => (value === '' ? undefined : value))
    @IsNumber()
    @IsOptional()
    latitud?: number;

    @Transform(({ value }) => (value === '' ? undefined : value))
    @IsNumber()
    @IsOptional()
    longitud?: number;

    @ApiProperty({ type: 'string', format: 'binary', required: true })
    dniPhoto?: any;


    @ApiProperty({ description: 'Phone number in the format 54911........' })
    @Transform(({ value }) => value.trim())
    @IsString()
    @Matches(/^[1-9]\d{10,14}$/, {
        message: 'Phone number must be in the format 54911........',
    })
    phoneNumber: string;

    // @IsOptional()
    // @IsArray()
    // @IsString({ each: true })
    // socialMediaLinks: string[];
}