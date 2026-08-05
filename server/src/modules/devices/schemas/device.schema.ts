import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type DeviceDocument = Device & Document;

@Schema({ timestamps: true })
export class Device {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: string;

  @Prop({ type: String, required: true, index: true })
  companyId: string;

  @Prop({ type: String, enum: ['android', 'windows', 'web'], default: 'web', index: true })
  platform: string;

  @Prop({ type: String, required: true })
  fcmToken: string;

  @Prop({ type: String, default: '1.0.3' })
  appVersion: string;

  @Prop({ type: String, default: '' })
  deviceModel: string;

  @Prop({ type: String, default: '' })
  osVersion: string;

  @Prop({ type: Date, default: Date.now })
  lastActiveAt: Date;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);
DeviceSchema.index({ userId: 1, platform: 1 });
DeviceSchema.index({ fcmToken: 1 }, { unique: true });
