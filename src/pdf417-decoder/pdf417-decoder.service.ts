import { BadRequestException, Injectable } from '@nestjs/common';
import { PDF417Reader, BinaryBitmap, HybridBinarizer, RGBLuminanceSource } from '@zxing/library';
import { decode as decodeJpeg } from 'jpeg-js';
import { PNG } from 'pngjs';


const barcodeScanner = new PDF417Reader();

@Injectable()
export class Pdf417DecoderService {
    private codeReader: PDF417Reader;

    constructor() {
        this.codeReader = new PDF417Reader();
    }



    detectAndScan(fileData: Buffer, mimeType: string) {
        let rawFileData;

        if (mimeType === 'image/jpeg') {
            rawFileData = decodeJpeg(fileData);
        } else if (mimeType === 'image/png') {
            rawFileData = PNG.sync.read(fileData);
        } else {
            throw new BadRequestException('El formato del archivo no esta soportado.');
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
