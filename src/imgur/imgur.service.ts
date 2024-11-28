import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as FormData from 'form-data';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ImgurService {

    constructor(
        private readonly configService: ConfigService,
    ) { }

    async uploadImage(file: Express.Multer.File): Promise<string | null> {
        const clientId = this.configService.get<string>('IMGUR_CLIENT_ID');

        try {
            const form = new FormData();
            form.append('image', file.buffer, file.originalname);

            const response = await axios.post('https://api.imgur.com/3/image', form, {
                headers: {
                    'Authorization': `Client-ID ${clientId}`,
                    ...form.getHeaders(),
                },
            });
            
            return response.data.data.link;
        } catch (error) {
            console.error('Error al subir la imagen a Imgur:', error);
            return null;
        }
    }
}
