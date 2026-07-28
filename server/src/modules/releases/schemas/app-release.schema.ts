import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AppReleaseDocument = AppRelease & Document;

@Schema({ timestamps: true })
export class AppRelease {
  @Prop({ type: String, required: true, index: true })
  version: string;

  @Prop({ type: Number, required: true, default: 1 })
  buildNumber: number;

  @Prop({ type: String, enum: ['android', 'windows', 'web'], default: 'android', index: true })
  platform: string;

  @Prop({ type: String, enum: ['apk', 'aab', 'exe', 'other'], default: 'apk' })
  fileType: string;

  @Prop({ type: String, required: true })
  downloadUrl: string;

  @Prop({ type: Number, default: 0 })
  fileSize: number;

  @Prop({ type: Boolean, default: false })
  forceUpdate: boolean;

  @Prop({ type: String, default: '1.0.0' })
  minSupportedVersion: string;

  @Prop({ type: String, default: 'A new update is available for BalajiOne Invoice.' })
  message: string;

  @Prop({ type: [String], default: [] })
  whatsNew: string[];

  @Prop({ type: Date, default: Date.now })
  releaseDate: Date;
}

export const AppReleaseSchema = SchemaFactory.createForClass(AppRelease);
AppReleaseSchema.index({ platform: 1, version: 1 });
