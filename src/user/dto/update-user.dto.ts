import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEnum, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { Gender } from '../entities/user.entity';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @IsNotEmpty()
    @IsString()
    @Length(8, 8)
    nroDni: string;
  
    @IsNotEmpty()
    @IsString()
    @Length(11, 11)
    nroTramiteDni: string;
  
    @IsNotEmpty()
    @IsEnum(Gender) // Use the enum validation
    gender: Gender;
  
    // @IsOptional()
    // @IsArray()
    // @IsString({ each: true })
    // socialMediaLinks: string[];
  
    @IsOptional()
    @IsString()
    dniImage: string; // Path to the uploaded DNI image
}
