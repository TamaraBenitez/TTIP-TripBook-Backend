// image-descriptor.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ImageDescriptor, ImageDescriptorSchema } from './image-descriptor.schema';
import { ImageDescriptorService } from './image-descriptor-mongo.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: ImageDescriptor.name, schema: ImageDescriptorSchema }]),
    ],
    providers: [ImageDescriptorService],
    exports: [ImageDescriptorService], // Esto es importante si quieres usar ImageDescriptorService en otros módulos
})
export class ImageDescriptorModule { }
