import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants/jwt.constants';
import { Pdf417DecoderService } from 'src/pdf417-decoder/pdf417-decoder.service';
import { CompareImageModule } from 'src/compare-image/compare-image.module';


@Module({
  imports: [UserModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1d' },
    }), CompareImageModule],
  controllers: [AuthController],
  providers: [AuthService, Pdf417DecoderService],
  exports: [AuthService]
})
export class AuthModule { }
