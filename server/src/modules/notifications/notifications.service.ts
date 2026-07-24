import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from './notification.schema';
import { BusinessDocument } from '../documents/document.schema';
import { Product } from '../catalog/product.schema';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name) private model: Model<NotificationDocument>,
    @InjectModel(BusinessDocument.name) private docModel: Model<BusinessDocument>,
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async list(companyId: string, onlyUnread = false) {
    const filter: Record<string, unknown> = { companyId: new Types.ObjectId(companyId) };
    if (onlyUnread) filter.read = false;
    return this.model.find(filter).sort({ createdAt: -1 }).limit(100).lean();
  }

  async unreadCount(companyId: string) {
    const count = await this.model.countDocuments({
      companyId: new Types.ObjectId(companyId),
      read: false,
    });
    return { count };
  }

  async markRead(companyId: string, id: string) {
    await this.model.updateOne(
      { _id: new Types.ObjectId(id), companyId: new Types.ObjectId(companyId) },
      { read: true },
    );
    return { ok: true };
  }

  async markAllRead(companyId: string) {
    await this.model.updateMany(
      { companyId: new Types.ObjectId(companyId), read: false },
      { read: true },
    );
    return { ok: true };
  }

  /** Idempotent upsert keyed by dedupeKey so scans don't duplicate alerts */
  private async upsert(companyId: string, n: Partial<Notification> & { dedupeKey: string }) {
    await this.model.updateOne(
      { companyId: new Types.ObjectId(companyId), dedupeKey: n.dedupeKey },
      { $setOnInsert: { ...n, companyId: new Types.ObjectId(companyId), read: false } },
      { upsert: true },
    );
  }

  /**
   * Recompute alert notifications for a company.
   * Called on demand (client refresh) and could be scheduled via cron.
   */
  async scan(companyId: string, now: Date = new Date()) {
    const cid = new Types.ObjectId(companyId);
    let created = 0;

    // Overdue invoices (balance > 0, dueDate in the past, not cancelled/paid)
    const overdue = await this.docModel
      .find({
        companyId: cid,
        docType: 'invoice',
        deletedAt: null,
        balanceAmount: { $gt: 0 },
        dueDate: { $lt: now },
        status: { $nin: ['cancelled', 'paid'] },
      })
      .select('number partyName balanceAmount dueDate')
      .lean();

    for (const inv of overdue) {
      await this.upsert(companyId, {
        type: 'payment-due',
        title: `Payment overdue: ${inv.number}`,
        body: `${inv.partyName ?? 'Customer'} owes ${inv.balanceAmount}`,
        level: 'warning',
        link: `/sales/invoice/${inv._id}`,
        dedupeKey: `payment-due:${inv._id}`,
        meta: { balance: inv.balanceAmount },
      });
      created++;
    }

    // Low stock products
    const lowStock = await this.productModel
      .find({
        companyId: cid,
        deletedAt: null,
        itemType: 'product',
        'stock.minimum': { $gt: 0 },
        $expr: { $lte: ['$stock.current', '$stock.minimum'] },
      })
      .select('name sku stock')
      .lean();

    for (const p of lowStock as Array<Record<string, any>>) {
      await this.upsert(companyId, {
        type: 'low-stock',
        title: `Low stock: ${p.name}`,
        body: `${p.stock?.current ?? 0} left (min ${p.stock?.minimum})`,
        level: 'critical',
        link: `/products/${p._id}`,
        dedupeKey: `low-stock:${p._id}`,
        meta: { current: p.stock?.current, minimum: p.stock?.minimum },
      });
      created++;
    }

    return { scanned: overdue.length + lowStock.length, upserted: created };
  }
}
