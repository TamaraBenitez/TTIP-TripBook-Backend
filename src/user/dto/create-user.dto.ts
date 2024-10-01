import { IsArray, IsDateString, IsEnum, IsIn, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { Gender } from '../entities/user.entity';

export class CreateUserDto extends RegisterDto {
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
}
