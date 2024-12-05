
import { Expose } from 'class-transformer';

export class OwnerResponseDto {
    @Expose()
    id: string;

    @Expose()
    name: string;

    @Expose()
    surname: string;
}
