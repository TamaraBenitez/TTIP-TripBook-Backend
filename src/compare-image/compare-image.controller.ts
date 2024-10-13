import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CompareImageService } from './compare-image.service';

@Controller('compare-image')
export class CompareImageController {
    constructor(private readonly compareImageService: CompareImageService) { }

    @Post()
    @UseInterceptors(FileInterceptor('userImage'))
    async compareFace(@UploadedFile() file: Express.Multer.File, @Body('userId') userId: string) {
        try {
            const result = await this.compareImageService.compareFaces(file.buffer, userId);
            return result;
        } catch (error) {
            console.error('Error durante la comparación de imágenes:', error);
            throw new Error('No se pudo validar identidad.');
        }
    }
}
