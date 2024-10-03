import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from 'src/user/user.service';
import { Pdf417DecoderService } from './pdf417-decoder.service';
import { Gender } from 'src/user/entities/user.entity';

@Controller('pdf417-decoder')
export class Pdf417DecoderController {

    constructor(private readonly userService: UserService, private readonly decoderService: Pdf417DecoderService) { }
    @Post('decode')
    @UseInterceptors(FileInterceptor('file'))
    async decodePdf417(@UploadedFile() file: Express.Multer.File, @Body() body: { userId: string }) {
        const results = this.decoderService.detectAndScan(file.buffer, file.mimetype);
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
        const genderString = data[3];  // This is the string you need to convert
        let gender: Gender;
      
        if (genderString === 'M') {
          gender = Gender.MALE;
        } else if (genderString === 'F') {
          gender = Gender.FEMALE;
        }
        const discrepancies = [];
            
        // Comparar con los datos del usuario
        // if (tramite !== user.nroTramiteDni) discrepancies.push('trámite');
        if (apellido !== user.surname.toUpperCase()) discrepancies.push('apellido');
        if (nombre !== user.name.toUpperCase()) discrepancies.push('nombre');
        // if (dni !== user.nroDni) discrepancies.push('DNI');
        // if (gender !== user.gender) discrepancies.push('género');

        const isValid = discrepancies.length === 0;

        return { valid: isValid, discrepancies: isValid ? null : discrepancies, results: data };

    }

}
