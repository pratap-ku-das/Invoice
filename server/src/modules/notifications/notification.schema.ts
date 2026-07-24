import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

export type NotificationType =
  | 'payment-due'
  | 'invoice-due'
  | 'low-stock'
  | 'gst-due'
  | 'purchase-due'
  | 'system';

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  companyId: Types.ObjectId;

  @Prop({ required: true })
  type: NotificationType;

  @Prop({ required: true })
  title: string;

  @Prop() body?: string;

  /** severity for UI badge color */
  @Prop({ default: 'info' })
  level: 'info' | 'warning' | 'critical';

  /** link target, e.g. /sales/invoice/:id */
  @Prop() link?: string;

  @Prop({ type: Object })
  meta?: Record<string, unknown>;

  @Prop({ default: false, index: true })
  read: boolean;

  /** de-dupe key so the same alert isn't re-created every scan */
  @Prop({ index: true })
  dedupeKey?: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index({ companyId: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ companyId: 1, dedupeKey: 1 }, { unique: true, sparse: true });
