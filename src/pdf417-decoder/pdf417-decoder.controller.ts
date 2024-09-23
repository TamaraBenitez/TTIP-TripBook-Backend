import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { decode as decodeJpeg } from 'jpeg-js';
import { PNG } from 'pngjs';
import { RGBLuminanceSource, BinaryBitmap, HybridBinarizer, PDF417Reader } from '@zxing/library';

const barcodeScanner = new PDF417Reader();

@Controller('pdf417-decoder')
export class Pdf417DecoderController {
    @Post('decode')
    @UseInterceptors(FileInterceptor('file'))
    async decodePdf417(@UploadedFile() file: Express.Multer.File) {
        const results = this.detectAndScan(file.buffer, file.mimetype);
        return { results: results ? results.getText() : null };
    }

    private detectAndScan(fileData: Buffer, mimeType: string) {
        let rawFileData;

        if (mimeType === 'image/jpeg') {
            rawFileData = decodeJpeg(fileData);
        } else if (mimeType === 'image/png') {
            rawFileData = PNG.sync.read(fileData); // Lee el PNG de esta manera
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
