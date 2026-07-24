import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BusinessDocument, BusinessDocumentDocument } from '../documents/document.schema';

interface DateRange {
  from?: string;
  to?: string;
}

@Injectable()
export class GstService {
  constructor(
    @InjectModel(BusinessDocument.name) private docModel: Model<BusinessDocumentDocument>,
  ) {}

  private match(companyId: string, docTypes: string[], range: DateRange) {
    const m: Record<string, unknown> = {
      companyId: new Types.ObjectId(companyId),
      docType: { $in: docTypes },
      status: { $ne: 'cancelled' },
      deletedAt: null,
    };
    if (range.from || range.to) {
      const date: Record<string, Date> = {};
      if (range.from) date.$gte = new Date(range.from);
      if (range.to) date.$lte = new Date(new Date(range.to).setHours(23, 59, 59, 999));
      m.date = date;
    }
    return m;
  }

  /** GST summary: output tax (sales) vs input tax (purchases) */
  async summary(companyId: string, range: DateRange) {
    const agg = async (docTypes: string[]) => {
      const rows = await this.docModel.aggregate([
        { $match: this.match(companyId, docTypes, range) },
        {
          $group: {
            _id: null,
            taxable: { $sum: '$subtotal' },
            cgst: { $sum: '$cgst' },
            sgst: { $sum: '$sgst' },
            igst: { $sum: '$igst' },
            cess: { $sum: '$cess' },
          },
        },
      ]);
      return rows[0] ?? { taxable: 0, cgst: 0, sgst: 0, igst: 0, cess: 0 };
    };

    const output = await agg(['invoice', 'sales-return']);
    const input = await agg(['purchase-bill', 'purchase-return']);
    const outputTax = output.cgst + output.sgst + output.igst + output.cess;
    const inputTax = input.cgst + input.sgst + input.igst + input.cess;

    return {
      output,
      input,
      outputTax: Math.round(outputTax * 100) / 100,
      inputTax: Math.round(inputTax * 100) / 100,
      netPayable: Math.round((outputTax - inputTax) * 100) / 100,
    };
  }

  /** HSN-wise summary (GSTR-1 table 12 style) */
  async hsnSummary(companyId: string, range: DateRange) {
    return this.docModel.aggregate([
      { $match: this.match(companyId, ['invoice'], range) },
      { $unwind: '$items' },
      {
        $group: {
          _id: { hsn: '$items.hsn', rate: '$items.taxRate' },
          qty: { $sum: '$items.qty' },
          taxable: { $sum: '$items.taxable' },
          cgst: { $sum: '$items.cgst' },
          sgst: { $sum: '$items.sgst' },
          igst: { $sum: '$items.igst' },
          cess: { $sum: '$items.cess' },
        },
      },
      { $sort: { taxable: -1 } },
      {
        $project: {
          _id: 0,
          hsn: '$_id.hsn',
          rate: '$_id.rate',
          qty: 1,
          taxable: 1,
          cgst: 1,
          sgst: 1,
          igst: 1,
          cess: 1,
        },
      },
    ]);
  }

  /** GSTR-1 B2B: invoices with party GSTIN */
  async gstr1(companyId: string, range: DateRange) {
    const invoices = await this.docModel
      .find({ ...this.match(companyId, ['invoice'], range) })
      .select('number date partyName partyGstin subtotal cgst sgst igst cess grandTotal interState')
      .sort({ date: 1 })
      .lean();

    const b2b = invoices.filter((i) => i.partyGstin);
    const b2c = invoices.filter((i) => !i.partyGstin);
    const sum = (arr: typeof invoices, key: keyof (typeof invoices)[number]) =>
      Math.round(arr.reduce((s, i) => s + (Number(i[key]) || 0), 0) * 100) / 100;

    return {
      b2b: { invoices: b2b, count: b2b.length, taxable: sum(b2b, 'subtotal'), total: sum(b2b, 'grandTotal') },
      b2c: { invoices: b2c, count: b2c.length, taxable: sum(b2c, 'subtotal'), total: sum(b2c, 'grandTotal') },
    };
  }
}
