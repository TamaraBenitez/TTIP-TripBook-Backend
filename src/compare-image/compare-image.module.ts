import { Module } from '@nestjs/common';
import { CompareImageController } from './compare-image.controller';
import { CompareImageService } from './compare-image.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports: [AuthModule],
    controllers: [CompareImageController],
    providers: [CompareImageService],
})
export class CompareImageModule { }
