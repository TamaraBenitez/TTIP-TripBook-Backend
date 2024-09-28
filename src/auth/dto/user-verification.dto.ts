import { IsOptional, IsDate, IsUUID } from 'class-validator';

export class UpdateUserVerificationDto {
  @IsUUID()
  @IsOptional()
  emailVerificationToken?: string;

  @IsDate()
  @IsOptional()
  emailVerificationTokenExpires?: Date;

  @IsOptional()
  isEmailVerified?: boolean;
}