import { Module } from '@nestjs/common';
import { CompareImageController } from './compare-image.controller';
import { CompareImageService } from './compare-image.service';
import { AuthModule } from 'src/auth/auth.module';
import { ImageDescriptorModule } from 'src/image-descriptor-mongo/image-descriptor-mongo.module';


@Module({
    imports: [AuthModule, ImageDescriptorModule],
    controllers: [CompareImageController],
    providers: [CompareImageService],
})
export class CompareImageModule { }
