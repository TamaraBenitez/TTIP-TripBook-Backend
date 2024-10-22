import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {

    @IsEmail()
    email: string

    @Transform(({ value }) => value.trim())
    @IsString()
    @MinLength(4)
    password: string

    @ApiProperty({ type: 'string', format: 'binary', required: true }) // Para Swagger, especifica que puede recibir archivos
    file?: any;
}