import { Body, Controller, Get, NotFoundException, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) { }

    @ApiOperation({ description: "Register/Create User", summary: "Register/Create User" })
    @Post('register')
    @UseInterceptors(FileInterceptor('dniPhoto'))
    register(@Body() registerDto: RegisterDto, @UploadedFile() file: Express.Multer.File) {
        return this.authService.register(registerDto, file)
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
    @Post('login')
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto)
    }
}
