import { BadRequestException, Body, Controller, Get, NotFoundException, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { Pdf417DecoderService } from 'src/pdf417-decoder/pdf417-decoder.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { Gender } from 'src/user/entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService, private readonly decoderService: Pdf417DecoderService) { }

    @ApiOperation({ description: "Register/Create User", summary: "Register/Create User" })
    @Post('register')
    @UseInterceptors(FileInterceptor('dniFile'))
    register(@Body() registerDto: { name: string,  surname: string, birthDate: Date, password: string, email: string}, 
                    @UploadedFile() dniFile: Express.Multer.File
                  ) {
      const results = this.decoderService.detectAndScan(dniFile.buffer, dniFile.mimetype);
      if (!results) {
        return { success: false, message: 'Could not read the DNI code.' };
      }
      const data = results.getText().split('@');
      const tramite = data[0];
      const apellido = data[1].toUpperCase();
      const nombre = data[2].split(' ')[0].toUpperCase();
      const dni = data[4];
      const fechaNacimiento = data[6];
      const genderString = data[3]; 
      let gender: Gender;

      if (genderString === 'M') {
        gender = Gender.MALE;
      } else if (genderString === 'F') {
        gender = Gender.FEMALE;
      }
      if (registerDto.surname.toUpperCase() !== apellido || registerDto.name.split(' ')[0].toUpperCase() !== nombre) {
        throw new BadRequestException('El nombre o apellido no coincide con los datos del DNI.');
      }
      const userDto: CreateUserDto = {
        ...registerDto,
        nroDni: dni,
        nroTramiteDni: tramite, 
        gender:gender,
        // socialMediaLinks: registerDto.socialMediaLinks || []
      };
        return this.authService.register(userDto);
    }

    @ApiOperation({ description: "Sign In", summary: "Sign In" })
    @Post('login')
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto)
    }

    @Get('verify-email')
    async verifyEmail(@Query('token') token: string): Promise<string> {
      const isVerified = await this.authService.verifyEmailToken(token);
  
      if (isVerified) {
        return 'Email successfully verified';
      } else {
        throw new BadRequestException('Invalid or expired token');
      }
    }
  
    @Post('send-verification-email')
    async sendVerificationEmail(@Body('userId') userId: string): Promise<string> {
      const user = await this.authService.getUserById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
  
      await this.authService.sendVerificationEmail(user);
      return 'Verification email sent';
    }
    
}
