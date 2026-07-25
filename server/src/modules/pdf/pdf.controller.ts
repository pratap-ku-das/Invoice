import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import archiver = require('archiver');
import { DocumentRenderService, RenderRequest } from './document-render.service';
import { BarcodeService } from './barcode.service';
import { THEMES, Theme } from './template.service';
import { DocType } from '../documents/document.schema';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ProductsService } from '../catalog/catalog.service';

const VALID_TYPES: DocType[] = [
  'invoice',
  'estimate',
  'challan',
  'sales-return',
  'purchase-bill',
  'purchase-order',
  'purchase-return',
  'proforma',
];

@ApiTags('pdf')
@ApiBearerAuth()
@Controller('pdf')
export class PdfController {
  constructor(
    private readonly render: DocumentRenderService,
    private readonly barcode: BarcodeService,
    private readonly products: ProductsService,
  ) {}

  @Get('themes')
  themes() {
    return THEMES;
  }

  /** Inline HTML preview (client shows in iframe / print) */
  @Get(':docType/:id/preview')
  async preview(
    @CurrentUser('companyId') companyId: string,
    @Param('docType') docType: string,
    @Param('id') id: string,
    @Query() q: RenderRequest,
    @Res() res: Response,
  ) {
    this.assertType(docType);
    const { html } = await this.render.buildHtml(companyId, docType as DocType, id, q);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(html);
  }

  @Get(':docType/:id/pdf')
  async pdf(
    @CurrentUser('companyId') companyId: string,
    @Param('docType') docType: string,
    @Param('id') id: string,
    @Query() q: RenderRequest,
    @Res() res: Response,
  ) {
    this.assertType(docType);
    try {
      const { buffer, filename } = await this.render.renderPdf(companyId, docType as DocType, id, q);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Content-Length': buffer.length,
      });
      return res.end(buffer);
    } catch (err) {
      const { html } = await this.render.buildHtml(companyId, docType as DocType, id, q);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(html);
    }
  }

  /** Bulk download as zip */
  @Post(':docType/bulk-pdf')
  async bulkPdf(
    @CurrentUser('companyId') companyId: string,
    @Param('docType') docType: string,
    @Body() body: { ids: string[]; theme?: Theme; paperSize?: string },
    @Res() res: Response,
  ) {
    this.assertType(docType);
    if (!body.ids?.length) throw new BadRequestException('ids required');

    const results = await this.render.renderBulk(companyId, docType as DocType, body.ids, {
      theme: body.theme,
      paperSize: body.paperSize as RenderRequest['paperSize'],
    });

    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${docType}-batch.zip"`,
    });
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);
    for (const r of results) archive.append(r.buffer, { name: r.filename });
    await archive.finalize();
  }

  // ---- Barcode / QR ----
  @Get('barcode/:code')
  async barcodeImage(@Param('code') code: string) {
    return { dataUrl: await this.barcode.barcodeDataUrl(code) };
  }

  @Get('qr')
  async qr(@Query('text') text: string) {
    return { dataUrl: await this.barcode.qrDataUrl(text) };
  }

  /** Barcode label sheet for selected products */
  @Post('labels')
  async labels(
    @CurrentUser('companyId') companyId: string,
    @Body() body: { productIds: string[]; copies?: number },
    @Res() res: Response,
  ) {
    const labels: { name: string; barcode: string; mrp?: number }[] = [];
    for (const pid of body.productIds ?? []) {
      const p = await this.products.findOne(companyId, pid);
      const code = (p as { barcode?: string; sku?: string }).barcode || (p as { sku?: string }).sku;
      if (!code) continue;
      for (let i = 0; i < (body.copies ?? 1); i++) {
        labels.push({ name: (p as { name: string }).name, barcode: code, mrp: (p as { mrp?: number }).mrp });
      }
    }
    const html = await this.barcode.labelSheetHtml(labels);
    res.set('Content-Type', 'text/html');
    res.send(html);
  }

  private assertType(docType: string) {
    if (!VALID_TYPES.includes(docType as DocType)) {
      throw new BadRequestException(`Unknown document type: ${docType}`);
    }
  }
}
