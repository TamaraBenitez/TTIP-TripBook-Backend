import { Expose } from "class-transformer";

export class UserResponseDto {

    @Expose()
    id: number

    @Expose()
    name: string

    @Expose()
    surname: string

    @Expose()
    email: string
}