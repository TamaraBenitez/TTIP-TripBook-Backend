import { BadRequestException, Body, Controller, HttpCode, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from 'src/user/user.service';
import { Pdf417DecoderService } from './pdf417-decoder.service';
import { Gender } from 'src/user/entities/user.entity';
import { format, parse } from 'date-fns';

@Controller('pdf417-decoder')
export class Pdf417DecoderController {

  constructor(private readonly userService: UserService, private readonly decoderService: Pdf417DecoderService) { }


  @Post('decode')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(200)
  async decodePdf417(@UploadedFile() file: Express.Multer.File, @Body() body: { userId: string }) {
    const results = this.decoderService.detectAndScan(file.buffer, file.mimetype);
    if (!results) {
      throw new BadRequestException('No se pudo leer el código.');
    }

    try {

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



      // Formateamos también la fecha de data[6] para comparar solo las fechas
      const fechaNacimientoFormatted = format(fechaNacimiento, 'yyyy-MM-dd');

      const user = await this.userService.findOneById(body.userId);
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
      // Formateamos la fecha de nacimiento del usuario para obtener solo la parte de la fecha (sin tiempo)
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
      await this.userService.update(body.userId, { ...user, isUserVerified: true });

      return { valid: true };

    }
    catch (error) {
      throw new BadRequestException(
        error.message || 'Ocurrió un error al procesar el código de barras.'
      );
    }


  }



}


