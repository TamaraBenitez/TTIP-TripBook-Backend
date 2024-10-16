import { Body, Controller, Get, NotFoundException, Param, Post, Res, UploadedFile, UseInterceptors, BadRequestException, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { Pdf417DecoderService } from 'src/pdf417-decoder/pdf417-decoder.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {

  constructor(private readonly authService: AuthService, private readonly decoderService: Pdf417DecoderService) { }

  @ApiOperation({ description: "Register/Create User", summary: "Register/Create User" })
  @ApiConsumes('multipart/form-data')
  @Post('register')
  @UseInterceptors(FileInterceptor('dniPhoto'))
  register(@Body() registerDto: RegisterDto, @UploadedFile() dniPhoto: Express.Multer.File) {
    return this.authService.register(registerDto, dniPhoto)
  }

  @ApiOperation({ description: "Obtener imagen del DNI por ID del usuario", summary: "Obtener imagen del DNI" })
  @Get('dni-image/:userId')
  async getDniImage(@Param('userId') userId: string, @Res() res: Response) {
    const result = await this.authService.getDniImagePath(userId);

    if (!result) {
      throw new NotFoundException('Imagen no encontrada');
    }

    const { filePath, mimeType } = result;
    console.log('Image Path:', filePath); // Imprimir ruta para depuración

    res.set('Content-Type', mimeType); // Establece el tipo de contenido correcto
    return res.sendFile(filePath)
  }

  @ApiOperation({ description: "Sign In", summary: "Sign In" })
  @ApiConsumes('multipart/form-data')
  @Post('login')
  @UseInterceptors(FileInterceptor('file'))
  login(@Body() loginDto: LoginDto, @UploadedFile() file: Express.Multer.File) {
    return this.authService.login(loginDto, file)
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
