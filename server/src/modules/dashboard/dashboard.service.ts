import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import dayjs from 'dayjs';
import { BusinessDocument, BusinessDocumentDocument } from '../documents/document.schema';
import { Payment, PaymentDocument } from '../payments/payment.schema';
import { Expense, ExpenseDocument } from '../expenses/expense.schema';
import { Product, ProductDocument } from '../catalog/product.schema';
import { PartiesService } from '../parties/parties.service';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(BusinessDocument.name) private docModel: Model<BusinessDocumentDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private parties: PartiesService,
    private inventory: InventoryService,
  ) {}

  private cid(companyId: string) {
    return new Types.ObjectId(companyId);
  }

  async summary(companyId: string) {
    const cid = this.cid(companyId);
    const todayStart = dayjs().startOf('day').toDate();
    const monthStart = dayjs().startOf('month').toDate();

    const salesMatch = (from: Date): PipelineStage.Match => ({
      $match: {
        companyId: cid,
        docType: 'invoice',
        status: { $ne: 'cancelled' },
        deletedAt: null,
        date: { $gte: from },
      },
    });

    const [
      todaySales,
      monthSales,
      todayProfit,
      pendingInvoices,
      outstanding,
      counts,
      stockValue,
      lowStock,
    ] = await Promise.all([
      this.docModel.aggregate([salesMatch(todayStart), { $group: { _id: null, total: { $sum: '$grandTotal' } } }]),
      this.docModel.aggregate([salesMatch(monthStart), { $group: { _id: null, total: { $sum: '$grandTotal' } } }]),
      this.docModel.aggregate([salesMatch(todayStart), { $group: { _id: null, total: { $sum: '$profit' } } }]),
      this.docModel.aggregate([
        {
          $match: {
            companyId: cid,
            docType: 'invoice',
            status: { $in: ['unpaid', 'partial'] },
            deletedAt: null,
          },
        },
        { $group: { _id: null, total: { $sum: '$balanceAmount' }, count: { $sum: 1 } } },
      ]),
      this.parties.outstandingTotals(companyId),
      this.productModel.countDocuments({ companyId: cid, deletedAt: null }),
      this.inventory.stockValue(companyId),
      this.inventory.lowStock(companyId),
    ]);

    return {
      todaySales: todaySales[0]?.total ?? 0,
      monthlySales: monthSales[0]?.total ?? 0,
      todayProfit: todayProfit[0]?.total ?? 0,
      pendingPayments: pendingInvoices[0]?.total ?? 0,
      pendingInvoiceCount: pendingInvoices[0]?.count ?? 0,
      outstandingReceivable: outstanding.receivable,
      outstandingPayable: outstanding.payable,
      totalCustomers: outstanding.customers,
      totalSuppliers: outstanding.suppliers,
      totalProducts: counts,
      stockValue: stockValue.value ?? 0,
      lowStockItems: lowStock.length,
    };
  }

  /** Monthly sales vs purchase for last N months */
  async salesOverview(companyId: string, months = 12) {
    const cid = this.cid(companyId);
    const from = dayjs().subtract(months - 1, 'month').startOf('month').toDate();

    const rows = await this.docModel.aggregate([
      {
        $match: {
          companyId: cid,
          docType: { $in: ['invoice', 'purchase-bill'] },
          status: { $ne: 'cancelled' },
          deletedAt: null,
          date: { $gte: from },
        },
      },
      {
        $group: {
          _id: { y: { $year: '$date' }, m: { $month: '$date' }, type: '$docType' },
          total: { $sum: '$grandTotal' },
          profit: { $sum: '$profit' },
        },
      },
    ]);

    const buckets: Record<string, { label: string; sales: number; purchase: number; profit: number }> = {};
    for (let i = 0; i < months; i++) {
      const d = dayjs().subtract(months - 1 - i, 'month');
      buckets[d.format('YYYY-M')] = { label: d.format('MMM YY'), sales: 0, purchase: 0, profit: 0 };
    }
    for (const r of rows) {
      const key = `${r._id.y}-${r._id.m}`;
      if (!buckets[key]) continue;
      if (r._id.type === 'invoice') {
        buckets[key].sales = r.total;
        buckets[key].profit = r.profit;
      } else {
        buckets[key].purchase = r.total;
      }
    }
    return Object.values(buckets);
  }

  async topProducts(companyId: string, limit = 5) {
    return this.docModel.aggregate([
      { $match: { companyId: this.cid(companyId), docType: 'invoice', status: { $ne: 'cancelled' }, deletedAt: null } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          qty: { $sum: '$items.qty' },
          revenue: { $sum: '$items.taxable' },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: limit },
      { $project: { _id: 0, name: '$_id', qty: 1, revenue: 1 } },
    ]);
  }

  async paymentStatus(companyId: string) {
    const rows = await this.docModel.aggregate([
      { $match: { companyId: this.cid(companyId), docType: 'invoice', status: { $ne: 'cancelled' }, deletedAt: null } },
      { $group: { _id: '$status', count: { $sum: 1 }, amount: { $sum: '$grandTotal' } } },
    ]);
    return rows.map((r) => ({ status: r._id, count: r.count, amount: r.amount }));
  }

  async recent(companyId: string) {
    const cid = this.cid(companyId);
    const [invoices, payments] = await Promise.all([
      this.docModel
        .find({ companyId: cid, docType: 'invoice', deletedAt: null })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('number date partyName grandTotal status')
        .lean(),
      this.paymentModel
        .find({ companyId: cid, deletedAt: null })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('number date partyName amount type mode')
        .lean(),
    ]);
    return { invoices, payments };
  }
}
