import { IsNumber, IsUUID } from "class-validator";

export class CreateTripWithOtherCoordinates {
    @IsUUID()
    userId: string;

    @IsUUID()
    tripId: string;

    @IsNumber()
    latitude: number

    @IsNumber()
    longitude: number
}