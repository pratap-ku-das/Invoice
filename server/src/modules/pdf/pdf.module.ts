import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { TemplateService } from './template.service';
import { BarcodeService } from './barcode.service';
import { DocumentRenderService } from './document-render.service';
import { PdfController } from './pdf.controller';
import { DocumentsModule } from '../documents/documents.module';
import { CompanyModule } from '../company/company.module';
import { CatalogModule } from '../catalog/catalog.module';

@Module({
  imports: [DocumentsModule, CompanyModule, CatalogModule],
  controllers: [PdfController],
  providers: [PdfService, TemplateService, BarcodeService, DocumentRenderService],
  exports: [PdfService, BarcodeService, DocumentRenderService],
})
export class PdfModule {}
