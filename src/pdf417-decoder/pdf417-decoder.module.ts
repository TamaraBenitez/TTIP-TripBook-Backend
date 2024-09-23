import { Module } from '@nestjs/common';
import { Pdf417DecoderService } from './pdf417-decoder.service';
import { Pdf417DecoderController } from './pdf417-decoder.controller';

@Module({
  providers: [Pdf417DecoderService],
  controllers: [Pdf417DecoderController]
})
export class Pdf417DecoderModule {}
