import { Module } from '@nestjs/common';
import { CompareImageController } from './compare-image.controller';
import { CompareImageService } from './compare-image.service';
import { UserModule } from 'src/user/user.module';


@Module({
    imports: [UserModule],
    controllers: [CompareImageController],
    providers: [CompareImageService],
    exports: [CompareImageService]
})
export class CompareImageModule { }
