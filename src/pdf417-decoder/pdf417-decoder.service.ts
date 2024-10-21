import { ForbiddenException, HttpStatus, Injectable } from '@nestjs/common';
import { PDF417Reader, BinaryBitmap, HybridBinarizer, RGBLuminanceSource } from '@zxing/library';
import { decode as decodeJpeg } from 'jpeg-js';
import { PNG } from 'pngjs';
import { existsSync } from 'fs';
import * as sharp from 'sharp';
import { UserService } from 'src/user/user.service';
import { Gender } from 'src/user/entities/user.entity';

const barcodeScanner = new PDF417Reader();

@Injectable()
export class Pdf417DecoderService {
    private codeReader: PDF417Reader;

    constructor(
        private readonly userService: UserService
    ) {
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

    async validateData(results, userId){
        var nombre;
        var apellido;
        var dni;
        var genderString;
        var gender: Gender;
        var fechaNacimiento;
        const discrepancies = [];

        const user = await this.userService.findOneById(userId);
            if (!user) {
                return { valid: false, message: 'Usuario no encontrado.' };
        }
        const dniData = results.getText().split('@');
        const licenseData = results.getText().split('\r\n');
        const isDni = dniData.length > 1;
        //DNI Format
        if(isDni){
            const tramite = dniData[0];
            fechaNacimiento = dniData[6];
            apellido = dniData[1].toUpperCase();
            nombre = dniData[2].split(' ')[0].toUpperCase();
            dni = dniData[4];
            genderString = dniData[3];   
            
            if (tramite !== user.nroTramiteDni) discrepancies.push('trámite');
        
        //License format    
        } else if(licenseData.length > 1){
            const vencimiento = licenseData[9].split('Vto:')[1];
            fechaNacimiento = licenseData[5];
            apellido = licenseData[4].toUpperCase();
            nombre = licenseData[3].split(' ')[0].toUpperCase();
            dni = licenseData[1];
            genderString = licenseData[2];   

            const [day, month, year] = vencimiento.split('/').map(Number);
            const expirationDate = new Date(year, month - 1, day);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if(expirationDate < today){
                throw new ForbiddenException("Your license has expired. You cannot create a trip.")
            }
        }
      
        if (genderString === 'M') {
          gender = Gender.MALE;
        } else if (genderString === 'F') {
          gender = Gender.FEMALE;
        }
            
        if (apellido !== user.surname.toUpperCase()) discrepancies.push('apellido');
        if (nombre !== user.name.split(' ')[0].toUpperCase()) discrepancies.push('nombre');
        if (user.nroDni && dni !== user.nroDni) discrepancies.push('DNI');
        if (user.gender && gender !== user.gender) discrepancies.push('género');

        const isValid = discrepancies.length === 0;

        if(isValid && isDni){
          await this.userService.update(userId, {...user, isUserVerified: true});
        }

        return { valid: isValid, discrepancies: isValid ? null : discrepancies, results: isDni ? dniData : licenseData }
    }
}
