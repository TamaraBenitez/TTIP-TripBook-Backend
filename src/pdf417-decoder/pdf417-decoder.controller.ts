import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from 'src/user/user.service';
import { Pdf417DecoderService } from './pdf417-decoder.service';
import { Gender } from 'src/user/entities/user.entity';

@Controller('pdf417-decoder')
export class Pdf417DecoderController {

    constructor(private readonly userService: UserService, private readonly decoderService: Pdf417DecoderService) { }
    @Post('decode')
    @UseInterceptors(FileInterceptor('file'))
    async decodePdf417(@UploadedFile() file: Express.Multer.File, @Body() body: { userId: string }) {
      const results = this.decoderService.detectAndScan(file.buffer, file.mimetype);
        if (!results) {
            return { valid: false, message: 'No se pudo leer el código.' };
        }
        
        return this.decoderService.validateData(results, body.userId);
    }

}
