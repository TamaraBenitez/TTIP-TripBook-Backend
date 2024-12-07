import { Expose } from 'class-transformer';

export class UpdateUserResponseDto {
    @Expose()
    id: string;

    @Expose()
    name: string;

    @Expose()
    surname: string;

    @Expose()
    email: string;

    @Expose()
    nroDni: string;

    @Expose()
    nroTramiteDni: string;

    @Expose()
    gender: string;

    @Expose()
    birthDate: Date;

    @Expose()
    province: string;

    @Expose()
    locality: string;

    @Expose()
    isEmailVerified: boolean;

    @Expose()
    isUserVerified: boolean;

    @Expose()
    phoneNumber: string;


}
