import { IsOptional, IsString } from 'class-validator';

export class RejectRequestDto {
    @IsOptional()
    @IsString()
    rejectionReason?: string;
}
