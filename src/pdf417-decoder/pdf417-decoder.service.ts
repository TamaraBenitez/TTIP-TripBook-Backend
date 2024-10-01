import { Injectable } from '@nestjs/common';
import { PDF417Reader, BinaryBitmap, HybridBinarizer, RGBLuminanceSource } from '@zxing/library';
import { decode as decodeJpeg } from 'jpeg-js';
import { PNG } from 'pngjs';
import { existsSync } from 'fs';
import * as sharp from 'sharp';

const barcodeScanner = new PDF417Reader();

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

    detectAndScan(fileData: Buffer, mimeType: string) {
        let rawFileData;

        if (mimeType === 'image/jpeg') {
            rawFileData = decodeJpeg(fileData);
        } else if (mimeType === 'image/png') {
            rawFileData = PNG.sync.read(fileData);
        } else {
            throw new Error('Unsupported file format');
        }

        try {
            const len = rawFileData.width * rawFileData.height;
            const luminancesUint8Array = new Uint8ClampedArray(len);

            for (let i = 0; i < len; i++) {
                luminancesUint8Array[i] =
                    ((rawFileData.data[i * 4] + rawFileData.data[i * 4 + 1] * 2 + rawFileData.data[i * 4 + 2]) / 4) &
                    0xff;
            }

            const luminanceSource = new RGBLuminanceSource(luminancesUint8Array, rawFileData.width, rawFileData.height);
            const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));
            return barcodeScanner.decode(binaryBitmap);
        } catch (err) {
            console.error('Error Reading Barcode: ', err.message);
            return null;
        }
    }
}
