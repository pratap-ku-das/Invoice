import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AuditLogDocument = HydratedDocument<AuditLog>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class AuditLog {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  companyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  userId?: Types.ObjectId;

  @Prop() userName?: string;

  /** e.g. create | update | delete | restore | cancel | payment | login */
  @Prop({ required: true, index: true })
  action: string;

  /** entity type, e.g. invoice | product | customer | payment */
  @Prop({ required: true, index: true })
  entity: string;

  @Prop({ type: Types.ObjectId })
  entityId?: Types.ObjectId;

  @Prop() entityLabel?: string;

  @Prop({ type: Object })
  meta?: Record<string, unknown>;

  @Prop() ip?: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
AuditLogSchema.index({ companyId: 1, createdAt: -1 });
AuditLogSchema.index({ companyId: 1, entity: 1, entityId: 1 });
