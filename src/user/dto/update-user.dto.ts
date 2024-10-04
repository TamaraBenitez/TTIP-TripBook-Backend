import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsDateString, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    
    
    @IsString()
    @IsOptional()
    name: string;

    @IsString()
    @IsOptional()
    surname: string;

    @IsEmail()
    @IsOptional()
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