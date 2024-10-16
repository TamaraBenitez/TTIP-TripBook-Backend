import { Injectable, OnModuleInit } from '@nestjs/common';
import * as faceapi from 'face-api.js';
import * as tf from '@tensorflow/tfjs-node';
import * as canvas from 'canvas';
import * as path from 'path';
import { existsSync } from 'fs';
import { UserService } from 'src/user/user.service';

// Implementación de node-canvas
const { Canvas, Image } = canvas;

// Crear clase personalizada para ImageData que soporte ambas firmas
class CustomImageData {
    data: Uint8ClampedArray;
    width: number;
    height: number;

    constructor(sw: number, sh: number);
    constructor(data: Uint8ClampedArray, sw: number, sh?: number);
    constructor(dataOrSw: any, swOrSh: number, sh?: number) {
        if (dataOrSw instanceof Uint8ClampedArray) {
            this.data = dataOrSw;
            this.width = swOrSh;
            this.height = sh ?? swOrSh;
        } else {
            this.data = new Uint8ClampedArray(dataOrSw * (sh ?? swOrSh) * 4); // Rellenar con datos vacíos
            this.width = dataOrSw;
            this.height = swOrSh;
        }
    }
}

// Monkey patch para face-api.js
faceapi.env.monkeyPatch({
    Canvas: Canvas as unknown as { new(): HTMLCanvasElement; prototype: HTMLCanvasElement },
    Image: Image as unknown as { new(): HTMLImageElement; prototype: HTMLImageElement },
    ImageData: CustomImageData as unknown as {
        new(sw: number, sh: number, settings?: ImageDataSettings): ImageData;
        new(data: Uint8ClampedArray, sw: number, sh?: number, settings?: ImageDataSettings): ImageData;
        prototype: ImageData;
    },
});

@Injectable()
export class CompareImageService implements OnModuleInit {
    constructor(private readonly userService: UserService) { }

    async onModuleInit() {
        // Cargar modelos al iniciar el módulo
        const modelPath = path.join(__dirname, '../../models');
        await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
        await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
        await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
        console.log('Modelos cargados correctamente.');
    }

    async imageProcessed(file: Express.Multer.File) {
        const userImage = await canvas.loadImage(file.buffer);
        const userCanvas = canvas.createCanvas(userImage.width, userImage.height);
        const userCtx = userCanvas.getContext('2d');
        userCtx.drawImage(userImage, 0, 0);

        const detectionsUser = await faceapi
            .detectAllFaces(userCanvas as unknown as HTMLCanvasElement)
            .withFaceLandmarks()
            .withFaceDescriptors();

        return detectionsUser
    }

    async compareFaces(fileBuffer: Buffer, userId: string) {
        // Cargar la imagen del usuario desde el archivo
        console.log('ya estoy en compareFaces')
        const userImage = await canvas.loadImage(fileBuffer);
        const userCanvas = canvas.createCanvas(userImage.width, userImage.height);
        const userCtx = userCanvas.getContext('2d');
        userCtx.drawImage(userImage, 0, 0);

        console.log('iniciando proceso de deteccion')
        const detectionsUser = await faceapi
            .detectAllFaces(userCanvas as unknown as HTMLCanvasElement)
            .withFaceLandmarks()
            .withFaceDescriptors();

        if (!detectionsUser.length) {
            throw new Error('No se detectó ninguna cara en la imagen proporcionada.');
        }

        console.log('finalizo proceso')

        // Obtener la imagen del DNI desde el servidor
        const user = await this.userService.findOneById(userId)


        const imageDescriptorBase64 = user.imageDescriptor;

        console.log('userDescriptor64', imageDescriptorBase64)

        if (!imageDescriptorBase64) {
            throw new Error('No se encontró un descriptor de imagen guardado para el usuario.');
        }

        // Decodificar el descriptor guardado desde base64
        const buffer = Buffer.from(imageDescriptorBase64, 'base64'); // Decodificar base64 a buffer
        const userSaveDescriptor = new Float32Array(buffer.buffer, buffer.byteOffset, buffer.length / Float32Array.BYTES_PER_ELEMENT); // Convertir a Float32Array
        const userDescriptor = detectionsUser[0].descriptor;
        console.log('userDescriptorDecodificado', userDescriptor)
        // Comparar las dos descripciones faciales
        const distance = faceapi.euclideanDistance(userDescriptor, userSaveDescriptor);
        const isSamePerson = distance < 0.6;

        return {
            isSamePerson,
            similarity: 1 - distance,
        };
    }
}
