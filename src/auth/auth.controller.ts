import { BadRequestException, Body, Controller, Get, NotFoundException, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) { }

    @ApiOperation({ description: "Register/Create User", summary: "Register/Create User" })
    @Post('register')
    register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto)
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
