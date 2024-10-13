import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ImageDescriptor, ImageDescriptorDocument } from './image-descriptor.schema';

@Injectable()
export class ImageDescriptorService {
    constructor(
        @InjectModel(ImageDescriptor.name) private imageDescriptorModel: Model<ImageDescriptorDocument>,
    ) { }

    async create(userId: string, descriptor: Float32Array): Promise<ImageDescriptor> {
        const descriptorArray = Array.from(descriptor); // Convertir Float32Array a array de números
        const newDescriptor = new this.imageDescriptorModel({ userId, descriptor: descriptorArray });
        console.log('se guardo conrrectamente en la db mongo?')
        return newDescriptor.save();

    }

    async findByUserId(userId: string) {
        const imageDescriptor = await this.imageDescriptorModel.findOne({ userId }).exec();
        if (imageDescriptor) {
            const floatDescriptor = new Float32Array(imageDescriptor.descriptor); // Convertir de number[] a Float32Array
            return {
                ...imageDescriptor.toObject(), // Convierte el documento de Mongoose a un objeto plano
                descriptor: floatDescriptor,  // Asignar el Float32Array solo cuando lo devuelvas
            };
        }
        return null;
    }
}
