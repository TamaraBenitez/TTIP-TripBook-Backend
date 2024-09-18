import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from 'src/trip-user/dto/user.dto';


@Injectable()
export class AuthService {

    constructor(private readonly usersService: UserService, private readonly jwtService: JwtService) { }
    async register(registerDto: RegisterDto) {

        const { name, surname, email, password, birthDate, province, locality, latitud, longitud } = registerDto
        const user = await this.usersService.findOneByEmail(email)

        if (user) {
            throw new BadRequestException('El usuario ya existe');
        }

        const createData = {
            name,
            surname,
            email,
            password: await bcrypt.hash(password, 12),
            birthDate,
            province,
            locality,
            latitud,
            longitud
        }
        await this.usersService.createUser(createData)
        const userCreated = await this.usersService.findOneByEmail(email)

        const userResponse = plainToInstance(UserResponseDto, userCreated, { excludeExtraneousValues: true })
        return userResponse
    }


    async login(loginDto: LoginDto) {
        const { email, password } = loginDto
        const user = await this.usersService.findOneByEmail(email)
        if (!user) {
            throw new UnauthorizedException('El email es incorrecto')
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            throw new UnauthorizedException('La contraseña es incorrecta')
        }

        const payload = { id: user.id }
        const idUser = user.id

        const token = await this.jwtService.signAsync(payload)
        return {
            token,
            email,
            idUser
        }
    }
}
