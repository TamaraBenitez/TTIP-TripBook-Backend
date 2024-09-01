import { PartialType } from '@nestjs/mapped-types';
import { CreateTripUserDto } from './create-trip-user.dto';

export class UpdateTripUserDto extends PartialType(CreateTripUserDto) {}
