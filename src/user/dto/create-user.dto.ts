import { IsEnum,  IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { Gender } from '../entities/user.entity';

export class CreateUserDto extends RegisterDto {
    @IsNotEmpty()
    @IsString()
    @Length(8, 8)
    @IsOptional()
    nroDni: string;

    @IsNotEmpty()
    @IsString()
    @Length(11, 11)
    @IsOptional()
    nroTramiteDni: string;

    @IsNotEmpty()
    @IsEnum(Gender)
    @IsOptional()
    gender: Gender;
    
    isUserVerified: boolean;
    // @IsOptional()
    // @IsArray()
    // @IsString({ each: true })
    // socialMediaLinks: string[];
}
