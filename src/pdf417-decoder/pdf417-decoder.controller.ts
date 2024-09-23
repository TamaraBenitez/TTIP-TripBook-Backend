import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { decode as decodeJpeg } from 'jpeg-js';
import { PNG } from 'pngjs';
import { RGBLuminanceSource, BinaryBitmap, HybridBinarizer, PDF417Reader } from '@zxing/library';
import { UserService } from 'src/user/user.service';

const barcodeScanner = new PDF417Reader();

@Controller('pdf417-decoder')
export class Pdf417DecoderController {

    constructor(private readonly userService: UserService) { }
    @Post('decode')
    @UseInterceptors(FileInterceptor('file'))
    async decodePdf417(@UploadedFile() file: Express.Multer.File, @Body() body: { userId: string }) {
        const results = this.detectAndScan(file.buffer, file.mimetype);
        if (!results) {
            return { valid: false, message: 'No se pudo leer el código.' };
        }

        const data = results.getText().split('@');
        const tramite = data[0];
        const apellido = data[1].toUpperCase();
        const nombre = data[2].split(' ')[0].toUpperCase();
        const dni = data[4];
        const fechaNacimiento = data[6];

        // Buscar el usuario en la base de datos
        const user = await this.userService.findOneById(body.userId);
        if (!user) {
            return { valid: false, message: 'Usuario no encontrado.' };
        }

        const discrepancies = [];

        // Comparar con los datos del usuario
        if (tramite !== user.nroTramiteDni) discrepancies.push('trámite');
        if (apellido !== user.surname.toUpperCase()) discrepancies.push('apellido');
        if (nombre !== user.name.toUpperCase()) discrepancies.push('nombre');
        if (dni !== user.nroDni) discrepancies.push('DNI');


        const isValid = discrepancies.length === 0;

        return { valid: isValid, discrepancies: isValid ? null : discrepancies, results: data };

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
