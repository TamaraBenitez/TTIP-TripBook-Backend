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
                    @UploadedFile() dniFile: Express.Multer.File = null
                  ) {
      var results;
      if(dniFile) {
        results = this.decoderService.detectAndScan(dniFile.buffer, dniFile.mimetype);
      }
      if (dniFile && !results) {
        throw new BadRequestException('Could not read the bar code. Please upload a clear photo of the code');
      }
      var tramite = null;
      var apellido = null;
      var nombre = null;
      var dni = null;
      var genderString = null;
      
      const data = results?.getText().split('@');
      if(data){
        tramite = data[0];
        apellido = data[1].toUpperCase();
        nombre = data[2].split(' ')[0].toUpperCase();
        dni = data[4];
        genderString = data[3]; 
        // const fechaNacimiento = data[6];
      }
      
      let gender = null;
      
      if (genderString === 'M') {
        gender = Gender.MALE;
      } else if (genderString === 'F') {
        gender = Gender.FEMALE;
      } 
      var isUserVerified =  apellido == registerDto.surname.toUpperCase() &&
                            nombre === registerDto.name.split(' ')[0].toUpperCase()
                            

      const userDto: CreateUserDto = {
        ...registerDto,
        nroDni: dni,
        nroTramiteDni: tramite, 
        gender:gender,
        isUserVerified: isUserVerified
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
