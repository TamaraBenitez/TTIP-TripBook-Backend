import { Injectable } from '@nestjs/common';
import { PDF417Reader, BinaryBitmap, HybridBinarizer, RGBLuminanceSource } from '@zxing/library';
import { existsSync } from 'fs';
import * as sharp from 'sharp';

@Injectable()
export class Pdf417DecoderService {
    private codeReader: PDF417Reader;

    constructor() {
        this.codeReader = new PDF417Reader();
    }

    async decodePdf417FromImage(filePath: string) {
        // Verifica si el archivo existe
        if (!existsSync(filePath)) {
            throw new Error(`El archivo no existe en la ruta: ${filePath}`);
        }

        console.log('File path to decode:', filePath);
        console.log('Checking if file exists...');

        try {
            const { data, info } = await sharp(filePath)
                .raw()
                .ensureAlpha()
                .toBuffer({ resolveWithObject: true });

            console.log('Image data:', data);
            console.log('Image info:', info);

            // Convierte el buffer a Uint8ClampedArray
            const clampedArray = new Uint8ClampedArray(data);

            // Crea un objeto RGBLuminanceSource
            const luminanceSource = new RGBLuminanceSource(clampedArray, info.width, info.height);
            const bitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));

            // Intenta decodificar el PDF417
            const result = this.codeReader.decode(bitmap);

            return {
                text: result.getText(), // Cambia a result.text si es necesario
            };
        } catch (error) {
            console.error('Error al procesar la imagen:', error);
            throw new Error('Error al procesar la imagen');
        }
    }
}
