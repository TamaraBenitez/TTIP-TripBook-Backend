import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { Gender } from '../entities/user.entity';

export class VerifyUserDto {
    @IsNotEmpty()
    @IsString()
    @Length(8, 8)
    nroDni: string;
  
    @IsNotEmpty()
    @IsString()
    @Length(11, 11)
    nroTramiteDni: string;
  
    @IsNotEmpty()
    @IsEnum(Gender)
    gender: Gender;
  
    // @IsOptional()
    // @IsArray()
    // @IsString({ each: true })
    // socialMediaLinks: string[];
  
    // @IsOptional()
    // @IsString()
    // dniImage: string; // Path to the uploaded DNI image
}
