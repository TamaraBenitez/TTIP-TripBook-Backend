import { BadRequestException, Injectable } from '@nestjs/common';
import { PDF417Reader, BinaryBitmap, HybridBinarizer, RGBLuminanceSource } from '@zxing/library';
import { format, parse } from 'date-fns';
import { decode as decodeJpeg } from 'jpeg-js';
import { PNG } from 'pngjs';
import { Gender } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';


const barcodeScanner = new PDF417Reader();

@Injectable()
export class Pdf417DecoderService {
    private codeReader: PDF417Reader;

    constructor(private readonly userService: UserService) {
        this.codeReader = new PDF417Reader();
    }

    async processDNI(file: Express.Multer.File, userId: string) {
        const results = this.detectAndScan(file.buffer, file.mimetype);
        if (!results) {
            throw new BadRequestException('No se pudo leer el código.');
        }

        if (!results.getText().includes('@')) {
            throw new BadRequestException('Este código de barras no pertenece a un DNI.');
        }

        const data = results.getText().split('@');
        const tramite = data[0];
        const apellido = data[1].split(' ')[0].toUpperCase();
        const nombre = data[2].split(' ')[0].toUpperCase();
        const dni = data[4];
        const fechaNacimientoString = data[6]; // "07/10/1994"

        // Parseamos la fecha de data[6] que está en formato dd/MM/yyyy
        const fechaNacimiento = parse(fechaNacimientoString, 'dd/MM/yyyy', new Date());
        const fechaNacimientoFormatted = format(fechaNacimiento, 'yyyy-MM-dd');

        const user = await this.userService.findOneById(userId);
        if (!user) {
            throw new BadRequestException('Usuario no encontrado.');
        }

        const genderString = data[3];
        const genderMap: { [key: string]: Gender } = {
            'M': Gender.MALE,
            'F': Gender.FEMALE,
        };

        const gender = genderMap[genderString];
        const userBirthDate = user.birthDate; // "1998-06-11 00:00:00"
        const userBirthDateFormatted = format(new Date(userBirthDate), 'yyyy-MM-dd');

        const comparisons = [
            { field: tramite, expected: user.nroTramiteDni, label: 'trámite' },
            { field: apellido, expected: user.surname.split(' ')[0].toUpperCase(), label: 'apellido' },
            { field: nombre, expected: user.name.split(' ')[0].toUpperCase(), label: 'nombre' },
            { field: dni, expected: user.nroDni, label: 'DNI' },
            { field: gender, expected: user.gender, label: 'género' },
            { field: fechaNacimientoFormatted, expected: userBirthDateFormatted, label: 'fecha de nacimiento' },
        ];

        const discrepancies = comparisons
            .filter(comp => comp.field !== comp.expected)
            .map(comp => comp.label);

        const isValid = discrepancies.length === 0;

        if (!isValid) {
            throw new BadRequestException('La información del DNI no coincide con los datos del usuario.');
        }
        await this.userService.update(userId, { ...user, isUserVerified: true });

        return { valid: true };
    }


    detectAndScan(fileData: Buffer, mimeType: string) {
        const decodeMap: { [key: string]: (data: Buffer) => any } = {
            'image/jpeg': decodeJpeg,
            'image/png': PNG.sync.read,
        };

        const decodeFunction = decodeMap[mimeType];

        if (!decodeFunction) {
            throw new BadRequestException('El formato del archivo no está soportado.');
        }

        try {
            const rawFileData = decodeFunction(fileData);
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
