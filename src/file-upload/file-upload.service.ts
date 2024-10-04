import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileUploadService {
    async uploadFile(file: Express.Multer.File): Promise<string> {
        const fileExtension = path.extname(file.originalname);
        const fileName = `${uuidv4()}${fileExtension}`;
        const uploadPath = path.join(__dirname, '../../uploads', fileName);

        // Crear el directorio si no existe
        if (!fs.existsSync(path.join(__dirname, '../../uploads'))) {
            fs.mkdirSync(path.join(__dirname, '../../uploads'), { recursive: true });
        }

        // Guardar la imagen en el sistema de archivos
        fs.writeFileSync(uploadPath, file.buffer);

        return fileName; // Retornamos el nombre del archivo para guardarlo en la base de datos

    }
}
