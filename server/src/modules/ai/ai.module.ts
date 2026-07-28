import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { BusinessDocument, BusinessDocumentSchema } from '../documents/document.schema';
import { Product, ProductSchema } from '../catalog/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BusinessDocument.name, schema: BusinessDocumentSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
