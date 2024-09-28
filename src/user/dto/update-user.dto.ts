import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsArray, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

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
    @IsString()
    gender: 'M' | 'F';
  
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    socialMediaLinks: string[];
  
    @IsOptional()
    @IsString()
    dniImage: string; // Path to the uploaded DNI image
}
