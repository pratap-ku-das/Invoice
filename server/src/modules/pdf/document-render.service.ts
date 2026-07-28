import { Injectable } from '@nestjs/common';
import { PdfService, PaperSize, Orientation } from './pdf.service';
import { TemplateService, Theme, THEMES } from './template.service';
import { BarcodeService } from './barcode.service';
import { DocumentsService } from '../documents/documents.service';
import { CompanyService } from '../company/company.service';
import { DocType } from '../documents/document.schema';

const TITLES: Record<string, string> = {
  invoice: 'Tax Invoice',
  estimate: 'Quotation & Estimate',
  proforma: 'Proforma Invoice',
  challan: 'Delivery Challan',
  'sales-return': 'Credit Note',
  'purchase-bill': 'Purchase Bill',
  'purchase-order': 'Purchase Order',
  'purchase-return': 'Debit Note',
  receipt: 'Receipt Voucher',
  payment: 'Payment Receipt',
  expense: 'Expense Voucher',
  journal: 'Journal Voucher',
  'sales-order': 'Sales Order',
  stock: 'Stock Transfer Note',
  statement: 'Customer Statement',
  ledger: 'Account Ledger',
  salary: 'Employee Salary Slip',
};

export interface RenderRequest {
  theme?: Theme;
  paperSize?: PaperSize;
  orientation?: Orientation;
}

@Injectable()
export class DocumentRenderService {
  constructor(
    private pdf: PdfService,
    private templates: TemplateService,
    private barcode: BarcodeService,
    private documents: DocumentsService,
    private company: CompanyService,
  ) {}

  async buildHtml(companyId: string, docType: DocType, id: string, req: RenderRequest) {
    const [doc, companyRaw] = await Promise.all([
      this.documents.findOne(companyId, docType, id),
      this.company.get(companyId),
    ]);

    // flatten nested bank details + print settings for the templates
    const c = companyRaw as unknown as Record<string, any>;
    const company = {
      ...c,
      bankName: c.bank?.bankName,
      bankAccount: c.bank?.accountNumber,
      bankIfsc: c.bank?.ifsc,
      defaultTheme: c.printSettings?.theme ?? 'modern',
    } as Record<string, any>;

    const theme: Theme = THEMES.includes(req.theme as Theme)
      ? (req.theme as Theme)
      : ((company.defaultTheme as Theme) ?? 'modern');
    const paperSize = req.paperSize ?? c.printSettings?.paperSize ?? 'A4';
    const thermal = paperSize.startsWith('thermal');

    let upiQr: string | undefined;
    if (company.upiId && !thermal) {
      upiQr = await this.barcode.upiQrDataUrl(
        company.upiId,
        company.name,
        doc.balanceAmount || doc.grandTotal,
        doc.number,
      );
    } else if (company.upiId && thermal) {
      upiQr = await this.barcode.upiQrDataUrl(company.upiId, company.name, doc.grandTotal, doc.number);
    }

    const items = (doc as any).items || [];
    const totalQty = items.reduce((sum: number, item: any) => sum + (Number(item.qty) || 0), 0);
    const totalItems = items.length;

    const hsnMap = new Map<string, { hsn: string; taxable: number; cgst: number; sgst: number; igst: number; taxRate: number; totalTax: number }>();
    for (const item of items) {
      const code = item.hsn || 'OTHERS';
      const existing = hsnMap.get(code) || { hsn: code, taxable: 0, cgst: 0, sgst: 0, igst: 0, taxRate: item.taxRate || 0, totalTax: 0 };
      existing.taxable += item.taxable || 0;
      existing.cgst += item.cgst || 0;
      existing.sgst += item.sgst || 0;
      existing.igst += item.igst || 0;
      existing.totalTax += (item.cgst || 0) + (item.sgst || 0) + (item.igst || 0);
      hsnMap.set(code, existing);
    }
    const hsnSummary = Array.from(hsnMap.values());

    const docData = {
      ...(doc as unknown as Record<string, unknown>),
      totalQty,
      totalItems,
      hsnSummary,
    };

    const html = this.templates.render({
      company: company as Record<string, unknown>,
      doc: docData,
      title: TITLES[docType] ?? 'Document',
      upiQr,
      meta: { theme, paperSize, thermal },
    });

    return { html, doc, theme, paperSize, orientation: req.orientation ?? 'portrait' };
  }

  async renderPdf(companyId: string, docType: DocType, id: string, req: RenderRequest) {
    const { html, doc, paperSize, orientation } = await this.buildHtml(companyId, docType, id, req);
    const buffer = await this.pdf.htmlToPdf(html, { paperSize, orientation });
    return { buffer, filename: `${docType}-${doc.number}.pdf` };
  }

  /** Bulk PDF: concatenation is left to client/zip; here we return per-doc buffers */
  async renderBulk(companyId: string, docType: DocType, ids: string[], req: RenderRequest) {
    const results = [];
    for (const id of ids) {
      results.push(await this.renderPdf(companyId, docType, id, req));
    }
    return results;
  }
}
