import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from 'src/trip-user/dto/user.dto';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import * as path from 'path';
import * as fs from 'fs';
import * as mime from 'mime-types';



@Injectable()
export class AuthService {

    constructor(private readonly usersService: UserService, private readonly jwtService: JwtService, private readonly fileUploadService: FileUploadService) { }
    async register(registerDto: RegisterDto, file: Express.Multer.File) {

        const { name, surname, email, password, birthDate, province, locality, latitud, longitud, nroDni, nroTramiteDni, gender } = registerDto
        const user = await this.usersService.findOneByEmail(email)

        if (user) {
            throw new BadRequestException('El usuario ya existe');
        }

        const fileName = await this.fileUploadService.uploadFile(file);

        const createData = {
            name,
            surname,
            email,
            password: await bcrypt.hash(password, 12),
            birthDate,
            province,
            locality,
            latitud,
            longitud,
            nroDni,
            nroTramiteDni,
            gender,
            dniImagePath: fileName
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

    async getDniImagePath(userId: string) {
        try {
            const user = await this.usersService.findOneById(userId); // Busca el usuario por ID

            if (!user || !user.dniImagePath) {
                return null; // No hay usuario o no hay imagen
            }

            const imagePath = path.join(__dirname, '../../uploads', user.dniImagePath);

            // Imprime la ruta para depuración
            console.log('Ruta de imagen:', imagePath);

            // Verifica si el archivo existe y devuelve la ruta
            if (fs.existsSync(imagePath)) {
                let mimeType = mime.lookup(user.dniImagePath) || 'application/octet-stream'; // Obtiene el tipo de contenido
                if (path.extname(user.dniImagePath) === '.jfif') {
                    mimeType = 'image/jpeg'; // Asumiendo que .jfif es un JPEG
                }
                console.log(mimeType)
                return { filePath: imagePath, mimeType };
            } else {
                return null; // Archivo no encontrado
            }
        } catch (error) {
            console.error('Error al buscar la imagen:', error);
            throw error;
        }
    }
}
