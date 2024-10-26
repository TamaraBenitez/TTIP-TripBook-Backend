import { Module } from '@nestjs/common';
import { CompareImageService } from './compare-image.service';
import { UserModule } from 'src/user/user.module';


@Module({
    imports: [UserModule],
    providers: [CompareImageService],
    exports: [CompareImageService]
})
export class CompareImageModule { }
