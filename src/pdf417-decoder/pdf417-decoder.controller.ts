import { BadRequestException, Body, Controller, HttpCode, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Pdf417DecoderService } from './pdf417-decoder.service';


@Controller('pdf417-decoder')
export class Pdf417DecoderController {

  constructor(private readonly decoderService: Pdf417DecoderService) { }


  @Post('decode/dni')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(200)
  async decodePdf417Dni(@UploadedFile() file: Express.Multer.File, @Body() body: { userId: string }) {
    try {
      const result = await this.decoderService.processDNI(file, body.userId);
      return result;
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Ocurrió un error al procesar el código de barras.'
      );
    }
  }

  @Post('decode/license')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(200)
  async decodePdf417License(@UploadedFile() file: Express.Multer.File, @Body() body: { userId: string }) {
    try {
      const result = await this.decoderService.processLicense(file, body.userId);
      return result;
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Ocurrió un error al procesar el código de barras.'
      );
    }
  }

}


