import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from './notification.schema';
import { NotificationLog, NotificationLogDocument } from './schemas/notification-log.schema';
import { BusinessDocument } from '../documents/document.schema';
import { Product } from '../catalog/product.schema';
import { Company, CompanyDocument } from '../company/company.schema';
import { FcmService } from './fcm.service';
import { DevicesService } from '../devices/devices.service';

export interface SendBroadcastDto {
  title: string;
  body: string;
  category?: 'transaction' | 'marketing' | 'reminder' | 'security' | 'update';
  targetType: 'all' | 'company' | 'subscription' | 'role' | 'user';
  targetId?: string;
  actionUrl?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name) private model: Model<NotificationDocument>,
    @InjectModel(NotificationLog.name) private logModel: Model<NotificationLogDocument>,
    @InjectModel(BusinessDocument.name) private docModel: Model<BusinessDocument>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    private readonly fcmService: FcmService,
    private readonly devicesService: DevicesService,
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

  /** Send Push Broadcast to FCM devices + Save in-app notifications for registered companies */
  async sendBroadcastNotification(senderId: string, dto: SendBroadcastDto) {
    const tokens = await this.devicesService.getTokensByTarget(dto.targetType, dto.targetId);

    const fcmRes = await this.fcmService.sendMulticastPush({
      tokens,
      title: dto.title,
      body: dto.body,
      category: dto.category || 'transaction',
      actionUrl: dto.actionUrl || '/app/dashboard',
    });

    // Create in-app Notification records in MongoDB for target company dashboards
    try {
      let targetCompanyIds: Types.ObjectId[] = [];
      if (dto.targetType === 'company' && dto.targetId && Types.ObjectId.isValid(dto.targetId)) {
        targetCompanyIds = [new Types.ObjectId(dto.targetId)];
      } else {
        const companies = await this.companyModel.find({}, { _id: 1 }).lean();
        targetCompanyIds = companies.map((c) => c._id);
      }

      if (targetCompanyIds.length > 0) {
        const inAppDocs = targetCompanyIds.map((cId) => ({
          companyId: cId,
          type: 'system' as const,
          title: dto.title,
          body: dto.body,
          level: 'info' as const,
          link: dto.actionUrl || '/app/dashboard',
          read: false,
          dedupeKey: `broadcast_${Date.now()}_${cId}_${Math.random().toString(36).substring(2, 6)}`,
        }));
        await this.model.insertMany(inAppDocs);
        this.logger.log(`Created ${inAppDocs.length} in-app notification records for broadcast.`);
      }
    } catch (err: any) {
      this.logger.warn(`Failed writing in-app notifications: ${err.message}`);
    }

    const status =
      fcmRes.failedCount === 0
        ? 'sent'
        : fcmRes.deliveredCount === 0
          ? 'failed'
          : 'partially_failed';

    const log = await this.logModel.create({
      title: dto.title,
      body: dto.body,
      category: dto.category || 'transaction',
      targetType: dto.targetType,
      targetId: dto.targetId || '',
      actionUrl: dto.actionUrl || '',
      sentCount: fcmRes.sentCount,
      deliveredCount: fcmRes.deliveredCount,
      failedCount: fcmRes.failedCount,
      readCount: 0,
      status,
      sentBy: senderId,
    });

    return log;
  }

  async getAdminNotificationLogs() {
    return this.logModel.find().sort({ createdAt: -1 }).limit(100).lean();
  }

  /** Idempotent upsert keyed by dedupeKey so scans don't duplicate alerts */
  private async upsert(companyId: string, n: Partial<Notification> & { dedupeKey: string }) {
    await this.model.updateOne(
      { companyId: new Types.ObjectId(companyId), dedupeKey: n.dedupeKey },
      { $setOnInsert: { ...n, companyId: new Types.ObjectId(companyId), read: false } },
      { upsert: true },
    );
  }

  async scan(companyId: string, now: Date = new Date()) {
    const cid = new Types.ObjectId(companyId);
    let created = 0;

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
