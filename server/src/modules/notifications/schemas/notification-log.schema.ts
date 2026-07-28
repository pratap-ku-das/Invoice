import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type NotificationLogDocument = NotificationLog & Document;

@Schema({ timestamps: true })
export class NotificationLog {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  body: string;

  @Prop({
    type: String,
    enum: ['transaction', 'marketing', 'reminder', 'security', 'update'],
    default: 'transaction',
  })
  category: string;

  @Prop({
    type: String,
    enum: ['all', 'company', 'subscription', 'role', 'user'],
    default: 'all',
  })
  targetType: string;

  @Prop({ type: String, default: '' })
  targetId: string;

  @Prop({ type: String, default: '' })
  actionUrl: string;

  @Prop({ type: Number, default: 0 })
  sentCount: number;

  @Prop({ type: Number, default: 0 })
  deliveredCount: number;

  @Prop({ type: Number, default: 0 })
  failedCount: number;

  @Prop({ type: Number, default: 0 })
  readCount: number;

  @Prop({ type: String, enum: ['sent', 'partially_failed', 'failed'], default: 'sent' })
  status: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  sentBy: string;
}

export const NotificationLogSchema = SchemaFactory.createForClass(NotificationLog);
