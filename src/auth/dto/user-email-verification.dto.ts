import { IsOptional, IsDate, IsUUID } from 'class-validator';

export class UpdateUserEmailVerificationDto {
  @IsUUID()
  @IsOptional()
  emailVerificationToken?: string;

  @IsDate()
  @IsOptional()
  emailVerificationTokenExpires?: Date;

  @IsOptional()
  isEmailVerified?: boolean;
}