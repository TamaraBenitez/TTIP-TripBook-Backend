import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { UpdateUserEmailVerificationDto } from '../../auth/dto/user-email-verification.dto';
import { Transform } from 'class-transformer';

export class UpdateUserDto extends UpdateUserEmailVerificationDto {
    @IsOptional()
    @IsString()
    province?: string;

    @IsOptional()
    @IsString()
    locality?: string;

    @IsOptional()
    @IsBoolean()
    isUserVerified?: boolean;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    phoneNumber?: string;


    @IsOptional()
    @Transform(({ value }) => value.trim())
    @IsString()
    @MinLength(4)
    currentPassword?: string;

    @IsOptional()
    @Transform(({ value }) => value.trim())
    @IsString()
    @MinLength(4)
    password?: string;
}
