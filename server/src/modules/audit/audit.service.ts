import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLog, AuditLogDocument } from './audit-log.schema';
import { PaginationQueryDto, paginate } from '../../common/dto/pagination.dto';

export interface AuditEntry {
  companyId: string;
  userId?: string;
  userName?: string;
  action: string;
  entity: string;
  entityId?: string | Types.ObjectId;
  entityLabel?: string;
  meta?: Record<string, unknown>;
  ip?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(@InjectModel(AuditLog.name) private model: Model<AuditLogDocument>) {}

  /** Fire-and-forget: never let audit failures break the main flow */
  record(entry: AuditEntry): void {
    this.model
      .create({
        companyId: new Types.ObjectId(entry.companyId),
        userId: entry.userId ? new Types.ObjectId(entry.userId) : undefined,
        userName: entry.userName,
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId ? new Types.ObjectId(entry.entityId) : undefined,
        entityLabel: entry.entityLabel,
        meta: entry.meta,
        ip: entry.ip,
      })
      .catch((err) => this.logger.warn(`audit write failed: ${err.message}`));
  }

  async list(
    companyId: string,
    query: PaginationQueryDto & { entity?: string; entityId?: string; action?: string },
  ) {
    const { page = 1, limit = 20, entity, entityId, action } = query;
    const filter: Record<string, unknown> = { companyId: new Types.ObjectId(companyId) };
    if (entity) filter.entity = entity;
    if (entityId) filter.entityId = new Types.ObjectId(entityId);
    if (action) filter.action = action;

    const [data, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.model.countDocuments(filter),
    ]);
    return paginate(data, total, page, limit);
  }

  /** Activity timeline for a single entity */
  async timeline(companyId: string, entity: string, entityId: string) {
    return this.model
      .find({
        companyId: new Types.ObjectId(companyId),
        entity,
        entityId: new Types.ObjectId(entityId),
      })
      .sort({ createdAt: -1 })
      .lean();
  }
}
