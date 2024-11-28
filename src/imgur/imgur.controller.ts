import { Controller, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImgurService } from './imgur.service'; // Asegúrate de tener el servicio de Imgur correctamente configurado

@Controller('imgur')
export class ImgurController {
    constructor(private readonly imgurService: ImgurService) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('image'))
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
        const uploadedImage = await this.imgurService.uploadImage(file);
        return uploadedImage; // Regresa la URL de la imagen subida
    }
}
