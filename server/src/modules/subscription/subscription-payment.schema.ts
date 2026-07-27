import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SubscriptionPaymentDocument = HydratedDocument<SubscriptionPayment>;

@Schema({ timestamps: true })
export class SubscriptionPayment {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  companyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  userId: Types.ObjectId;

  @Prop({ default: 'razorpay' })
  gateway: string;

  @Prop({ required: true, index: true })
  orderId: string;

  @Prop({ index: true })
  paymentId?: string;

  @Prop()
  signature?: string;

  @Prop({ required: true })
  amount: number; // in INR (e.g. 499)

  @Prop({ default: 'INR' })
  currency: string;

  @Prop({ required: true, enum: ['basic', 'pro'] })
  plan: string;

  @Prop({ default: 'monthly' })
  billingCycle: string;

  @Prop({ required: true, enum: ['created', 'captured', 'failed', 'refunded'], default: 'created' })
  status: string;

  @Prop()
  paymentMethod?: string;

  @Prop()
  paidAt?: Date;

  @Prop({ type: Object })
  rawGatewayResponse?: Record<string, unknown>;
}

export const SubscriptionPaymentSchema = SchemaFactory.createForClass(SubscriptionPayment);
