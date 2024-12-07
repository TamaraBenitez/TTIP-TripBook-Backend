import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { UpdateUserEmailVerificationDto } from '../../auth/dto/user-email-verification.dto';

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
}
