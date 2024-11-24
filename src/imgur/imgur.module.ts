import { Module } from '@nestjs/common';
import { ImgurService } from './imgur.service';
import { ImgurController } from './imgur.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [ImgurService],
  controllers: [ImgurController],
  exports: [ImgurService]
})
export class ImgurModule { }
