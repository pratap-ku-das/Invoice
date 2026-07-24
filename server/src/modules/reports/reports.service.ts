import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BusinessDocument, BusinessDocumentDocument } from '../documents/document.schema';
import { Payment, PaymentDocument } from '../payments/payment.schema';
import { Expense, ExpenseDocument } from '../expenses/expense.schema';

interface DateRange {
  from?: string;
  to?: string;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(BusinessDocument.name) private docModel: Model<BusinessDocumentDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
  ) {}

  private dateMatch(range: DateRange) {
    const m: Record<string, Date> = {};
    if (range.from) m.$gte = new Date(range.from);
    if (range.to) m.$lte = new Date(new Date(range.to).setHours(23, 59, 59, 999));
    return Object.keys(m).length ? m : undefined;
  }

  private baseMatch(companyId: string, docType: string, range: DateRange) {
    const match: Record<string, unknown> = {
      companyId: new Types.ObjectId(companyId),
      docType,
      status: { $ne: 'cancelled' },
      deletedAt: null,
    };
    const date = this.dateMatch(range);
    if (date) match.date = date;
    return match;
  }

  async salesReport(companyId: string, range: DateRange) {
    const rows = await this.docModel.aggregate([
      { $match: this.baseMatch(companyId, 'invoice', range) },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          taxable: { $sum: '$subtotal' },
          tax: { $sum: '$taxTotal' },
          total: { $sum: '$grandTotal' },
          profit: { $sum: '$profit' },
          received: { $sum: '$paidAmount' },
          outstanding: { $sum: '$balanceAmount' },
        },
      },
    ]);
    return rows[0] ?? { count: 0, taxable: 0, tax: 0, total: 0, profit: 0, received: 0, outstanding: 0 };
  }

  async purchaseReport(companyId: string, range: DateRange) {
    const rows = await this.docModel.aggregate([
      { $match: this.baseMatch(companyId, 'purchase-bill', range) },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          taxable: { $sum: '$subtotal' },
          tax: { $sum: '$taxTotal' },
          total: { $sum: '$grandTotal' },
          paid: { $sum: '$paidAmount' },
          outstanding: { $sum: '$balanceAmount' },
        },
      },
    ]);
    return rows[0] ?? { count: 0, taxable: 0, tax: 0, total: 0, paid: 0, outstanding: 0 };
  }

  async profitReport(companyId: string, range: DateRange) {
    const [sales, expenses] = await Promise.all([
      this.salesReport(companyId, range),
      this.expenseModel.aggregate([
        {
          $match: {
            companyId: new Types.ObjectId(companyId),
            deletedAt: null,
            ...(this.dateMatch(range) ? { date: this.dateMatch(range) } : {}),
          },
        },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
    ]);
    const expenseTotal = expenses[0]?.total ?? 0;
    return {
      grossProfit: sales.profit,
      expenses: expenseTotal,
      netProfit: Math.round((sales.profit - expenseTotal) * 100) / 100,
      revenue: sales.total,
    };
  }

  /** time-series grouped by day/month/year */
  async salesSeries(companyId: string, range: DateRange, granularity: 'day' | 'month' | 'year' = 'month') {
    const fmt = { day: '%Y-%m-%d', month: '%Y-%m', year: '%Y' }[granularity];
    return this.docModel.aggregate([
      { $match: this.baseMatch(companyId, 'invoice', range) },
      {
        $group: {
          _id: { $dateToString: { format: fmt, date: '$date' } },
          total: { $sum: '$grandTotal' },
          profit: { $sum: '$profit' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, period: '$_id', total: 1, profit: 1, count: 1 } },
    ]);
  }

  async partyLedger(companyId: string, partyId: string, range: DateRange) {
    const cid = new Types.ObjectId(companyId);
    const pid = new Types.ObjectId(partyId);
    const date = this.dateMatch(range);

    const [docs, payments] = await Promise.all([
      this.docModel
        .find({
          companyId: cid,
          partyId: pid,
          deletedAt: null,
          status: { $ne: 'cancelled' },
          ...(date ? { date } : {}),
        })
        .select('number date docType grandTotal')
        .lean(),
      this.paymentModel
        .find({ companyId: cid, partyId: pid, deletedAt: null, ...(date ? { date } : {}) })
        .select('number date amount type mode')
        .lean(),
    ]);

    type Entry = { date: Date; type: string; number: string; debit: number; credit: number };
    const entries: Entry[] = [];
    for (const d of docs) {
      const isSale = ['invoice', 'purchase-return'].includes(d.docType);
      entries.push({
        date: d.date,
        type: d.docType,
        number: d.number,
        debit: isSale ? d.grandTotal : 0,
        credit: isSale ? 0 : d.grandTotal,
      });
    }
    for (const p of payments) {
      entries.push({
        date: p.date,
        type: `payment-${p.type}`,
        number: p.number,
        debit: 0,
        credit: p.amount,
      });
    }
    entries.sort((a, b) => a.date.getTime() - b.date.getTime());

    let running = 0;
    const ledger = entries.map((e) => {
      running += e.debit - e.credit;
      return { ...e, balance: Math.round(running * 100) / 100 };
    });
    return { entries: ledger, closingBalance: Math.round(running * 100) / 100 };
  }

  async topCustomers(companyId: string, range: DateRange, limit = 10) {
    return this.docModel.aggregate([
      { $match: this.baseMatch(companyId, 'invoice', range) },
      {
        $group: {
          _id: { partyId: '$partyId', name: '$partyName' },
          total: { $sum: '$grandTotal' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
      { $limit: limit },
      { $project: { _id: 0, name: '$_id.name', total: 1, count: 1 } },
    ]);
  }
}
