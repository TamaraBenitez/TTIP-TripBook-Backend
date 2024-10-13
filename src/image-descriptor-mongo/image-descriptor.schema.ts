import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ImageDescriptorDocument = ImageDescriptor & Document;

@Schema()
export class ImageDescriptor {
    @Prop({ required: true })
    userId: string;

    @Prop({ type: Array, required: true }) // Se define como un array genérico
    descriptor: number[]; // Almacenar el array de Float32 como un array de números

}

export const ImageDescriptorSchema = SchemaFactory.createForClass(ImageDescriptor);
