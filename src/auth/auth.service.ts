import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from 'src/trip-user/dto/user.dto';
import { v4 as uuidv4 } from 'uuid';
import { NotFoundException } from '@nestjs/common';
import { addMinutes } from 'date-fns';
import { User } from 'src/user/entities/user.entity';
import { UpdateUserVerificationDto } from './dto/user-verification.dto';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';


@Injectable()
export class AuthService {
    private transporter;
    
    constructor(private readonly usersService: UserService, private readonly jwtService: JwtService, private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>("SMTP_HOST"),
            port: this.configService.get<string>("SMTP_PORT"),
            secure: this.configService.get<string>("SMTP_SECURE") === "true", 
            auth: {
              user: this.configService.get<string>("SMTP_USER"),
              pass: this.configService.get<string>("SMTP_PASS"),
            },
          });
     }
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
    async getUserById(id: string) :Promise<User> {
        return await this.usersService.findOneById(id);
    }
    async generateEmailVerificationToken(userId: string): Promise<string> {
        const user = await this.usersService.findOneById(userId);
      
        if (!user) {
          throw new NotFoundException('User not found');
        }
      
        const token = uuidv4(); // unique token      
        const updateDto: UpdateUserVerificationDto = {
            emailVerificationToken: token,
            emailVerificationTokenExpires: addMinutes(new Date(), 15),
          };

        await this.usersService.update(userId, updateDto);
      
        return token;
    }
    
    async sendVerificationEmail(user: User): Promise<void> {
        const token = await this.generateEmailVerificationToken(user.id);
        const verificationUrl = `${this.configService.get<string>("SMTP_BASEURL")}?token=${token}`;
        const mailOptions = {
          from: '"TripBook" <tripbook14@gmail.com>', 
          to: user.email,
          subject: 'Verify your email address',
          text: `Hello ${user.name},\n\nPlease verify your email by clicking the link: ${verificationUrl}\n\nThank you!`,
          html: `<p>Hello ${user.name},</p><p>Please verify your email by clicking the link below:</p><a href="${verificationUrl}">Verify Email</a><p>Thank you!</p>`, // HTML body
        };
    
        await this.transporter.sendMail(mailOptions,(error, info) =>{
            if(error){
                console.log(error)
            } else console.log(info)
        }) 
    }

    async verifyEmailToken(token: string): Promise<boolean> {
        const user = await this.usersService.findByVerifyToken(token);
      
        if (!user) {
          return false;
        }
      
        // Check if the token has expired
        if (!user || new Date() > user.emailVerificationTokenExpires) {
            throw new BadRequestException('Invalid or expired token');
          }
      
        const updateDto: UpdateUserVerificationDto = {
            emailVerificationToken: null,
            emailVerificationTokenExpires: null,
            isEmailVerified: true,
          };
      
        await this.usersService.update(user.id, updateDto);
      
        return true;
    }
    
}
