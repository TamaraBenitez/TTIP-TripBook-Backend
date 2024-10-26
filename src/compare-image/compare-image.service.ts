import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import * as faceapi from 'face-api.js';
import * as tf from '@tensorflow/tfjs-node';
import * as canvas from 'canvas';
import { UserService } from '../user/user.service';

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
        const modelPath = 'models';
        await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
        await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
        await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
        console.log('Modelos cargados correctamente.');
    }

    async imageProcessed(file: Express.Multer.File) {
        try {
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
        catch (error) {
            throw new BadRequestException('No se pudo procesar la imagen.')
        }
    }

    async compareFaces(file: Express.Multer.File, userId: string) {
        try {
            // Cargar la imagen del usuario desde el archivo
            const userImage = await canvas.loadImage(file.buffer);
            const userCanvas = canvas.createCanvas(userImage.width, userImage.height);
            const userCtx = userCanvas.getContext('2d');
            userCtx.drawImage(userImage, 0, 0);

            const detectionsUser = await this.imageProcessed(file);
            if (!detectionsUser.length) {
                throw new Error('No se detectó ninguna cara en la imagen proporcionada.');
            }

            const user = await this.userService.findOneById(userId);
            const imageDescriptorBase64 = user.imageDescriptor;

            if (!imageDescriptorBase64) {
                throw new Error('No se encontró un descriptor de imagen guardado para el usuario.');
            }

            const buffer = Buffer.from(imageDescriptorBase64, 'base64');
            const userSaveDescriptor = new Float32Array(buffer.buffer, buffer.byteOffset, buffer.length / Float32Array.BYTES_PER_ELEMENT);
            const userDescriptor = detectionsUser[0].descriptor;

            const distance = faceapi.euclideanDistance(userDescriptor, userSaveDescriptor);
            const isSamePerson = distance < 0.6;

            return {
                isSamePerson,
                similarity: 1 - distance,
            };
        } catch (error) {

            throw new BadRequestException(error.message);
        }
    }
}
