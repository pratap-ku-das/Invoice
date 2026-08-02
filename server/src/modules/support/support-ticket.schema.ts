import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SupportTicketDocument = HydratedDocument<SupportTicket>;

export type TicketPriority = 'low' | 'medium' | 'high';
export type TicketStatus = 'open' | 'in-progress' | 'resolved' | 'closed';

@Schema({ timestamps: true })
export class SupportTicket {
  @Prop({ required: true, unique: true, index: true })
  ticketId: string;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  companyId: Types.ObjectId;

  @Prop({ required: true })
  companyName: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ default: 'General Query' })
  category: string;

  @Prop({ type: String, enum: ['low', 'medium', 'high'], default: 'medium' })
  priority: TicketPriority;

  @Prop({ type: String, enum: ['open', 'in-progress', 'resolved', 'closed'], default: 'open' })
  status: TicketStatus;

  @Prop({ required: true })
  message: string;

  @Prop({ type: Types.ObjectId, index: true })
  createdBy: Types.ObjectId;

  @Prop({ default: 'Company Admin' })
  createdByName: string;

  @Prop()
  adminResponse?: string;
}

export const SupportTicketSchema = SchemaFactory.createForClass(SupportTicket);
SupportTicketSchema.index({ companyId: 1, createdAt: -1 });
SupportTicketSchema.index({ status: 1, createdAt: -1 });
