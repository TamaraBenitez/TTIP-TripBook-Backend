import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {

    constructor(private readonly usersService: UserService, private readonly jwtService: JwtService) { }
    async register(registerDto: RegisterDto) {
        console.log(registerDto)
        const { name, surname, email, password, age, province, locality, latitud, longitud } = registerDto
        const user = await this.usersService.findOneByEmail(email)

        if (user) {
            throw new BadRequestException('El usuario ya existe');
        }

        const createData = {
            name,
            surname,
            email,
            password: await bcrypt.hash(password, 12),
            age,
            province,
            locality,
            latitud,
            longitud
        }

        await this.usersService.createUser(createData)
        const userCreated = await this.usersService.findOneByEmail(email)

        return userCreated
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
