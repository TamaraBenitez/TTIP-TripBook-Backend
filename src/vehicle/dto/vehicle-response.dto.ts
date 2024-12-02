
import { Expose, Type } from 'class-transformer';
import { OwnerResponseDto } from './owner-response.dto';

export class VehicleResponseDto {
    @Expose()
    id: string;

    @Expose()
    model: string;

    @Expose()
    color: string;

    @Expose()
    plateNumber: string;

    @Expose()
    year: number;

    @Expose()
    @Type(() => OwnerResponseDto)
    owner: OwnerResponseDto;
}
