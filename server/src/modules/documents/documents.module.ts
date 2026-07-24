import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BusinessDocument, BusinessDocumentSchema } from './document.schema';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { InventoryModule } from '../inventory/inventory.module';
import { PartiesModule } from '../parties/parties.module';
import { CatalogModule } from '../catalog/catalog.module';

@Module({
  imports: [
    InventoryModule,
    PartiesModule,
    CatalogModule,
    MongooseModule.forFeature([
      { name: BusinessDocument.name, schema: BusinessDocumentSchema },
    ]),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService, MongooseModule],
})
export class DocumentsModule {}
